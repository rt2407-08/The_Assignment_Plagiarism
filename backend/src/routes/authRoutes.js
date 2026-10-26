const express = require("express");
const router = express.Router();

const {
  registerInstructor,
  loginInstructor
} = require("../controllers/instructorController");

// Standard Auth Endpoints (/api/auth/login, /api/auth/register, /api/auth/signup)
router.post("/login", loginInstructor);
router.post("/register", registerInstructor);
router.post("/signup", registerInstructor);

module.exports = router;
