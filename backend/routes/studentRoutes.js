const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  getStudentProfile
} = require("../controllers/studentController");

const {
  verifyToken,
  requireRole
} = require("../middleware/authMiddleware");

router.post("/signup", registerStudent);
router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/me", verifyToken, requireRole("student"), getStudentProfile);

module.exports = router;