
const express = require("express");
const router = express.Router();

const {
  createSimilarityReport,
  getAllSimilarityReports,
  getReportBySubmission,
  getAssignmentSimilarityReport
} = require("../controllers/similarityReportController");

// POST /api/similarity-reports
router.post("/", createSimilarityReport);

// GET /api/similarity-reports
router.get("/", getAllSimilarityReports);

// GET /api/similarity-reports/assignment/:id
router.get("/assignment/:id", getAssignmentSimilarityReport);

// GET /api/similarity-reports/submission/:submissionId
router.get("/submission/:submissionId", getReportBySubmission);

module.exports = router;
