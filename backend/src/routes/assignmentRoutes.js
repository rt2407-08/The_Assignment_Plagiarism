
const express = require("express");
const router = express.Router();

const {
  getAllAssignments,
  getAssignmentByCode,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require("../controllers/assignmentController");

const {
  getAssignmentSimilarityReport
} = require("../controllers/similarityReportController");

router.get("/", getAllAssignments);
router.get("/code/:code", getAssignmentByCode);
router.get("/:id/similarity-report", getAssignmentSimilarityReport);
router.post("/", createAssignment);
router.patch("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;
