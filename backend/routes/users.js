const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

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
