// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const ModerationLog = require("../models/ModerationLog");
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

// PATCH /api/admin/users/:userId/role → Update user role
router.patch("/users/:userId/role", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
        ).select("-password");

        await new ModerationLog({
            admin: req.user.id,
            action: "change_role",
            targetType: "user",
            targetId: req.params.userId,
            reason: `Role changed to ${role}`
        }).save();

        res.json(user);
    } catch (err) {
        console.error("Admin role update failed:", err);
        res.status(500).json({ message: "Failed to update role" });
    }
});

// GET /api/admin/reports → Get all reported posts
router.get("/reports", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reportedPosts = await Post.find({ "reports.0": { $exists: true } })
            .populate("author", "name username avatarUrl")
            .populate("reports.user", "name username")
            .sort({ "reports.createdAt": -1 });
        res.json(reportedPosts);
    } catch (err) {
        console.error("Admin reports fetch failed:", err);
        res.status(500).json({ message: "Failed to fetch reports" });
    }
});

// DELETE /api/admin/posts/:id → Moderation: Delete any post
router.delete("/posts/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await new ModerationLog({
            admin: req.user.id,
            action: "delete_post",
            targetType: "post",
            targetId: req.params.id,
            details: { content: post.content, author: post.author }
        }).save();

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted by admin" });
    } catch (err) {
        console.error("Admin post deletion failed:", err);
        res.status(500).json({ message: "Failed to delete post" });
    }
});

// PATCH /api/admin/users/:userId/verify → Toggle user verification
router.patch("/users/:userId/verify", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { verified } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { verified },
            { new: true }
        ).select("-password");

        await new ModerationLog({
            admin: req.user.id,
            action: verified ? "verify_user" : "unverify_user",
            targetType: "user",
            targetId: req.params.userId
        }).save();

        res.json(user);
    } catch (err) {
        console.error("Admin verification update failed:", err);
        res.status(500).json({ message: "Failed to update verification status" });
    }
});

// PATCH /api/admin/users/:userId/status → Ban/Unban user
router.patch("/users/:userId/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["active", "banned"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status },
            { new: true }
        ).select("-password");

        await new ModerationLog({
            admin: req.user.id,
            action: status === "banned" ? "ban_user" : "unban_user",
            targetType: "user",
            targetId: req.params.userId
        }).save();

        res.json(user);
    } catch (err) {
        console.error("Admin status update failed:", err);
        res.status(500).json({ message: "Failed to update user status" });
    }
});

// DELETE /api/admin/reports/:postId → Dismiss reports (clear without deleting post)
router.delete("/reports/:postId", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $set: { reports: [] } },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Post not found" });

        await new ModerationLog({
            admin: req.user.id,
            action: "dismiss_reports",
            targetType: "post",
            targetId: req.params.postId
        }).save();

        res.json({ message: "Reports dismissed" });
    } catch (err) {
        console.error("Admin report dismissal failed:", err);
        res.status(500).json({ message: "Failed to dismiss reports" });
    }
});

// GET /api/admin/logs → Get moderation audit logs
router.get("/logs", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const logs = await ModerationLog.find()
            .populate("admin", "name")
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        console.error("Admin logs fetch failed:", err);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
});

module.exports = router;
