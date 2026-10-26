const Instructor = require("../models/Instructor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "veritext_super_secret_jwt_key_2026";

// =====================================
// INSTRUCTOR REGISTRATION
// =====================================
const registerInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (
      !cleanName ||
      !cleanEmail ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a full name, valid email, and password of at least 6 characters."
      });
    }

    const existingInstructor = await Instructor.findOne({
      email: cleanEmail
    });

    if (existingInstructor) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const instructor = await Instructor.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash
    });

    const token = jwt.sign(
      {
        id: instructor._id,
        role: "instructor",
        email: instructor.email,
        name: instructor.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Instructor registered successfully.",
      token,
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: "instructor"
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    console.error("Instructor registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register instructor."
    });
  }
};

// =====================================
// INSTRUCTOR LOGIN
// =====================================
const loginInstructor = async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password = req.body.password;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const instructor = await Instructor.findOne({ email });

    if (
      !instructor ||
      !(await bcrypt.compare(password, instructor.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password."
      });
    }

    const token = jwt.sign(
      {
        id: instructor._id,
        role: "instructor",
        email: instructor.email,
        name: instructor.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: "instructor"
      }
    });
  } catch (error) {
    console.error("Instructor login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in."
    });
  }
};

// =====================================
// GET CURRENT INSTRUCTOR PROFILE (PROTECTED BY JWT)
// =====================================
const getInstructorProfile = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.user.id).select("-passwordHash");
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found."
      });
    }

    return res.status(200).json({
      success: true,
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: "instructor"
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerInstructor,
  loginInstructor,
  getInstructorProfile
};
