require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

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
