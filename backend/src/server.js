const path = require("node:path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config();

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
const authRoutes = require("./routes/authRoutes");

app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/similarity-reports", similarityReportRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/auth", authRoutes);

// Root & Health check routes for Render
app.get(["/", "/api"], (req, res) => {
  res.json({
    success: true,
    message: "VeriText backend API is live and operational!",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      assignments: "/api/assignments",
      submissions: "/api/submissions",
      similarityReports: "/api/similarity-reports",
      students: "/api/students",
      instructors: "/api/instructors"
    },
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting"
  });
});

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

// Bind immediately to 0.0.0.0 so Render and cloud proxies can verify service health instantly
app.listen(PORT, "0.0.0.0", () => {
  console.log(`VeriText server running on port ${PORT}`);
});

// Connect to MongoDB Atlas
if (process.env.MONGODB_URI) {
  console.log("Connecting to MongoDB Atlas...");
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000
  })
  .then(() => console.log("MongoDB Atlas connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
  console.warn("MONGODB_URI environment variable is missing.");
}