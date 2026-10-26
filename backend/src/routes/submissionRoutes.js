
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
  createSubmission,
  getSubmissionsByAssignment,
  getAllSubmissions
} = require("../controllers/submissionController");

// Graceful handler for optional file upload
const handleOptionalUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error"
      });
    }
    next();
  });
};

// POST /api/submissions (supports JSON body and optional Multer file upload)
router.post("/", handleOptionalUpload, createSubmission);

// GET /api/submissions
router.get("/", getAllSubmissions);

// GET /api/submissions/assignment/:assignmentId
router.get("/assignment/:assignmentId", getSubmissionsByAssignment);

module.exports = router;
