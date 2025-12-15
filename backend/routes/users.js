const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// ... (lines 6-85 remain existing code, I will use precise targeting below instead of replacing whole file)

// GET /api/users/recent → fetch recent users for landing page
router.get("/recent", async (req, res) => {
  try {
    const users = await User.find({ username: { $exists: true, $ne: "" } })
      .select("name username avatarUrl profilePicture")
      .limit(30)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Fetch recent users failed:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /api/users/search → search users by name or username
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .select("name username avatarUrl profilePicture")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// GET /api/users/check/:username → check if available
router.get("/check/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (err) {
    console.error("Check username failed:", err);
    res.status(500).json({ message: "Check failed" });
  }
});

// GET /api/users/u/:username → get public profile
router.get("/u/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password -email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch public profile failed:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

// GET /api/users/me → fetch current user profile
router.get("/me", authMiddleware, async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// POST /api/users/follow/:id → follow a user
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Add to my following
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });

    // Add to target's followers
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });

    // Create Notification
    await Notification.findOneAndUpdate(
      { recipient: targetUserId, sender: currentUserId, type: "follow" },
      { read: false, createdAt: Date.now() }, // Reset read status if re-following
      { upsert: true, new: true }
    );

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error("Follow failed:", err);
    res.status(500).json({ message: "Follow failed" });
  }
});

// POST /api/users/unfollow/:id → unfollow a user
router.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Remove from my following
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    // Remove from target's followers
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow failed:", err);
    res.status(500).json({ message: "Unfollow failed" });
  }
});

// PUT /api/users/me → update current user profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    // Return consistent user object format (matching login response)
    res.json({
      id: updated._id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      verified: updated.verified,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      linkedinUrl: updated.linkedinUrl,
      skills: updated.skills,
      interests: updated.interests,
      followers: updated.followers,
      following: updated.following,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /api/users/:id/network → get populated followers/following
router.get("/:id/network", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name username avatarUrl profilePicture")
      .populate("following", "name username avatarUrl profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    console.error("Fetch network failed:", err);
    res.status(500).json({ message: "Fetch network failed" });
  }
});

module.exports = router;
