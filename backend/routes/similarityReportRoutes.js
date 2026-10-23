
const express = require("express");
const router = express.Router();

const {
  createSimilarityReport,
  getReportBySubmission
} = require("../controllers/similarityReportController");

// POST /api/similarity-reports
router.post("/", createSimilarityReport);

// GET /api/similarity-reports/submission/:submissionId
router.get("/submission/:submissionId", getReportBySubmission);

module.exports = router;
