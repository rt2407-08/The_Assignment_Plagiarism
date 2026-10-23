
const express = require("express");
const router = express.Router();

const {
  createSubmission,
  getSubmissionsByAssignment
} = require("../controllers/submissionController");

// POST /api/submissions
router.post("/", createSubmission);

// GET /api/submissions/assignment/:assignmentId
router.get("/assignment/:assignmentId", getSubmissionsByAssignment);

module.exports = router;
