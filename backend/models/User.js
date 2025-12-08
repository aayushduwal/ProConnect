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
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
