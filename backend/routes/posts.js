const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { calculateContentSimilarity, calculateInteractionScore } = require("../utils/recommendationUtils");

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
        // Combine skills and interests for the user's content vector
        const userContentBase = [
            ...(user.skills || []),
            ...(user.interests || [])
        ];

        // --- 2. SCORE CANDIDATES ---
        const scoredPosts = posts.map(post => {
            // A. Content Similarity (Cosine Similarity)
            const itemContentBase = [
                ...(post.skills || []),
                ...(post.technologies || []),
                post.category
            ].filter(Boolean);

            const contentSimilarity = calculateContentSimilarity(userContentBase, itemContentBase);

            // B. Interaction Score (Weighted Signals)
            const interactionScore = calculateInteractionScore(post, {
                views: 0.1,
                likes: 0.3,
                saves: 0.4,
                follows: 0.0 // Posts don't have followers, but could use author's followers
            });

            // C. Combined Final Score
            // Combine both factors. Content similarity is normalized [0,1], 
            // interaction score is raw (can be boosted/normalized as needed).
            // We give content similarity a high impact by multiplying or adding with a base.
            const finalScore = (contentSimilarity * 10) + interactionScore;

            // Optional: Time Decay (Optional: fresher posts get slight boost)
            const daysOld = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
            const decayedScore = finalScore / (1 + daysOld * 0.1);

            return { ...post, score: decayedScore, debug: { contentSimilarity, interactionScore } };
        });

        // --- 3. SORT & RETURN ---
        scoredPosts.sort((a, b) => b.score - a.score);

        res.json(scoredPosts);
    } catch (err) {
        console.error("Recommendation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET posts by a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
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

        // --- UPDATE USER STREAK ---
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                let newStreakCount = user.streakCount || 0;

                if (user.lastPostDate) {
                    const lastPost = new Date(user.lastPostDate);
                    const lastPostDay = new Date(lastPost.getFullYear(), lastPost.getMonth(), lastPost.getDate());
                    const daysDiff = Math.floor((today - lastPostDay) / (1000 * 60 * 60 * 24));

                    if (daysDiff === 0) {
                        // Already posted today - no streak change
                    } else if (daysDiff === 1) {
                        // Posted yesterday - increment streak
                        newStreakCount += 1;
                    } else {
                        // Gap of more than 1 day - reset streak to 1
                        newStreakCount = 1;
                    }
                } else {
                    // First post ever - start streak at 1
                    newStreakCount = 1;
                }

                // Update longest streak if new streak is higher
                const newLongestStreak = Math.max(user.longestStreak || 0, newStreakCount);

                await User.findByIdAndUpdate(req.user._id, {
                    streakCount: newStreakCount,
                    lastPostDate: now,
                    longestStreak: newLongestStreak
                });
            }
        } catch (streakErr) {
            console.error("Failed to update streak:", streakErr);
            // Don't fail the post creation if streak update fails
        }

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
