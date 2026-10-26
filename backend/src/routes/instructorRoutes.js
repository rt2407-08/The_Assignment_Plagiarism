const express = require("express");
const router = express.Router();

const {
  registerInstructor,
  loginInstructor,
  getInstructorProfile
} = require("../controllers/instructorController");

const {
  verifyToken,
  requireRole
} = require("../middleware/authMiddleware");

router.post("/signup", registerInstructor);
router.post("/register", registerInstructor);
router.post("/login", loginInstructor);
router.get("/me", verifyToken, requireRole("instructor"), getInstructorProfile);

module.exports = router;
