require("dotenv").config();
const User = require("./models/User");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/proconnect";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅MongoDB connected"))
  .catch((err) => console.error("❎MongoDB connnection error:", err));

app.get("/", (req, res) => {
  res.send("✅Backend is running");
});

app.listen(PORT, () => {
  console.log(`✅Server running on http://localhost:${PORT}`);
});

// Simple test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: "Backend is live!" });
// });

// MongoDB test route
app.get("/api/db-test", async (req, res) => {
  try {
    // Replace 'User' with one of your actual Mongoose models
    const users = await User.find();
    res.json({ message: "MongoDB connected!", users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
