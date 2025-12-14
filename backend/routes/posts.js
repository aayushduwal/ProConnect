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

// GET all posts (Hybrid Recommendation System)
router.get("/", async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        let posts = await Post.find()
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .lean(); // Use lean for performance since we aren't saving these instances

        if (!userId) {
            // cleaning up posts if no user logged in, just sort by newest
            return res.json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }

        const user = await User.findById(userId);
        if (!user) return res.json(posts);

        // --- 1. BUILD USER PREFERENCE PROFILE ---
        const userPreferences = new Map();

        // A. Explicit Signals (High Weight)
        if (user.skills) user.skills.forEach(skill => userPreferences.set(skill.toLowerCase(), 5));
        if (user.interests) user.interests.forEach(interest => userPreferences.set(interest.toLowerCase(), 3));

        // B. Implicit Signals (Interaction History)
        // Find posts user has Liked or Saved
        // We'll filter existing posts array to avoid partial DB lookups, assuming 'posts' contains history
        // In production, you'd aggregate this separately to avoid fetching *all* posts first.
        const likedPosts = posts.filter(p => p.likes.some(id => id.toString() === userId));
        const savedPosts = posts.filter(p => p.saves && p.saves.some(id => id.toString() === userId));

        const updatePrefs = (post, weight) => {
            if (post.skills) post.skills.forEach(s => userPreferences.set(s.toLowerCase(), (userPreferences.get(s.toLowerCase()) || 0) + weight));
            if (post.technologies) post.technologies.forEach(t => userPreferences.set(t.toLowerCase(), (userPreferences.get(t.toLowerCase()) || 0) + weight));
            if (post.category) userPreferences.set(post.category.toLowerCase(), (userPreferences.get(post.category.toLowerCase()) || 0) + weight);
        };

        likedPosts.forEach(p => updatePrefs(p, 2)); // Like = Medium signal
        savedPosts.forEach(p => updatePrefs(p, 3)); // Save = Stronger signal


        // --- 2. SCORE CANDIDATES ---
        const scoredPosts = posts.map(post => {
            let score = 0;

            // Content Similarity Score
            const postTags = [
                ...(post.skills || []),
                ...(post.technologies || []),
                post.category
            ].filter(Boolean).map(t => t.toLowerCase());

            postTags.forEach(tag => {
                if (userPreferences.has(tag)) {
                    score += userPreferences.get(tag);
                }
            });

            // Popularity Boost (Normalize slightly so it doesn't overwhelm content match)
            score += (post.likes.length * 0.5);
            score += ((post.saves ? post.saves.length : 0) * 0.8);
            score += ((post.views ? post.views.length : 0) * 0.05);

            // Time Decay (Optional: fresher posts get slight boost)
            const daysOld = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
            score = score / (1 + daysOld * 0.1); // Decay factor

            return { ...post, score };
        });

        // --- 3. SORT & RETURN ---
        scoredPosts.sort((a, b) => b.score - a.score);

        res.json(scoredPosts);
    } catch (err) {
        console.error("Recommendation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST create a new post
router.post("/", verifyToken, async (req, res) => {
    try {
        const { content, title, image, mediaType, mediaUrl, skills, technologies, category } = req.body;

        // Validate
        if (!content) return res.status(400).json({ error: "Content is required" });

        const newPost = new Post({
            author: req.user._id, // Assumes auth middleware populates req.user
            content,
            title,
            image, // Legacy
            mediaType: mediaType || (image ? 'image' : 'none'),
            mediaUrl: mediaUrl || image,
            skills,
            technologies,
            category,
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

// PUT Save/Unsave a post
router.put("/:id/save", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        if (post.saves.includes(userId)) {
            post.saves = post.saves.filter((id) => id.toString() !== userId.toString());
        } else {
            post.saves.push(userId);
        }

        await post.save();
        res.json(post.saves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Track View
router.put("/:id/view", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        // Only add if not already viewed to avoid duplicate weight (optional logic)
        if (!post.views.includes(userId)) {
            post.views.push(userId);
            await post.save();
        }

        res.json(post.views);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a post (only by author)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        // Check if the user is the author of the post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
