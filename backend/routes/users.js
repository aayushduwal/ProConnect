const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/users/recent → fetch recent users for landing page
router.get("/recent", async (req, res) => {
  try {
    const users = await User.find({ username: { $exists: true, $ne: "" } })
      .select("name username avatarUrl")
      .limit(30)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Fetch recent users failed:", err);
    res.status(500).json({ message: "Failed to fetch users" });
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

// PUT /api/users/me → update current user profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
