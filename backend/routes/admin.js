// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET /api/admin/stats → Get system statistics
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();

        res.json({
            users: userCount,
            posts: postCount,
            systemStatus: "Healthy",
        });
    } catch (err) {
        console.error("Admin stats fetch failed:", err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

// GET /api/admin/users → Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("Admin users fetch failed:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

module.exports = router;
