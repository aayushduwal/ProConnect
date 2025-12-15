const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    location: { type: String, default: "" },
    pronouns: { type: String, default: "" },
    website: { type: String, default: "" },
    calendarLink: { type: String, default: "" },
    socialLinks: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      figma: { type: String, default: "" },
      producthunt: { type: String, default: "" },
      wellfound: { type: String, default: "" },
      behance: { type: String, default: "" },
      mastodon: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
      threads: { type: String, default: "" },
    },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Streak tracking
    streakCount: { type: Number, default: 0 },
    lastPostDate: { type: Date, default: null },
    longestStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
