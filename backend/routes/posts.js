const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// Helper middleware to get user from request (assuming auth middleware sets req.user or we verify token here)
// For now, we will assume the frontend sends the user ID in the headers or body since we are using Firebase token verification
// Ideally, we should use the auth middleware we created earlier.
const verifyToken = async (req, res, next) => {
    // SIMPLE AUTH for now: Getting 'x-user-id' from header or handle Firebase token
    // In a real app, use the verifyToken middleware from auth.js
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    req.user = { _id: userId };
    next();
};

// GET all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new post
router.post("/", verifyToken, async (req, res) => {
    try {
        const { content, image } = req.body;

        // Validate
        if (!content) return res.status(400).json({ error: "Content is required" });

        const newPost = new Post({
            author: req.user._id, // Assumes auth middleware populates req.user
            content,
            image,
        });

        const savedPost = await newPost.save();
        // Populate author immediately for frontend return
        await savedPost.populate("author", "name avatarUrl username headline");

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Like/Unlike a post
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        // Check if already liked
        if (post.likes.includes(userId)) {
            // Unlike
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a comment
router.post("/:id/comment", verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Comment text is required" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const newComment = {
            user: req.user._id,
            text,
        };

        post.comments.push(newComment);
        await post.save();

        // Re-fetch to populate the new comment user
        const updatedPost = await Post.findById(req.params.id).populate("comments.user", "name avatarUrl username");

        res.json(updatedPost.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
