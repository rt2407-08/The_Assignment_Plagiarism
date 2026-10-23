
const express = require("express");
const router = express.Router();

const {
  getAllAssignments,
  createAssignment
} = require("../controllers/assignmentController");

// GET /api/assignments
router.get("/", getAllAssignments);

// POST /api/assignments
router.post("/", createAssignment);

module.exports = router;
