const path = require("node:path");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const similarityReportRoutes = require("./routes/similarityReportRoutes");
const studentRoutes = require("./routes/studentRoutes");
const instructorRoutes = require("./routes/instructorRoutes");

app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/similarity-reports", similarityReportRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);

// Serve static frontend files (landing page index.html, instructor.html, dashboard, etc.)
app.use(express.static(path.join(__dirname, "..")));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VeriText backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not connected"
  });
});

// Start server after connecting to MongoDB
async function startServer() {
    console.log("1. Starting VeriText backend...");
  
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing from backend .env");
      }
  
      console.log("2. Connecting to MongoDB...");
  
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
      });
  
      console.log("3. MongoDB connected successfully!");
  
      app.listen(PORT, "127.0.0.1", () => {
        console.log(`4. Server running at http://127.0.0.1:${PORT}`);
      });
    } catch (error) {
      console.error("Startup error:", error);
    }
  }
  
  startServer();