
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "veritext_super_secret_jwt_key_2026";

// =====================================
// STUDENT REGISTRATION
// =====================================

const registerStudent = async (req, res) => {
  try {
    const { name, studentId, email, password } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const cleanStudentId =
      typeof studentId === "string"
        ? studentId.trim().toUpperCase()
        : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (
      !cleanName ||
      !cleanStudentId ||
      !cleanEmail ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a name, student ID, valid email, and password of at least 6 characters."
      });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { studentId: cleanStudentId },
        { email: cleanEmail }
      ]
    });

    if (existingStudent) {
      const duplicateField =
        existingStudent.studentId === cleanStudentId
          ? "Student ID"
          : "Email";

      return res.status(409).json({
        success: false,
        message: `${duplicateField} is already registered.`
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name: cleanName,
      studentId: cleanStudentId,
      email: cleanEmail,
      passwordHash
    });

    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
        email: student.email,
        studentId: student.studentId,
        name: student.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      token,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        role: "student"
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This student ID or email is already registered."
      });
    }

    console.error("Student registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register student."
    });
  }
};

// =====================================
// STUDENT LOGIN
// =====================================

const loginStudent = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.studentId || "").trim();
    const password = req.body.password;

    if (!identifier || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Student ID and password are required."
      });
    }

    const student = await Student.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { studentId: identifier }
      ]
    });

    if (
      !student ||
      !(await bcrypt.compare(password, student.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email/student ID or password."
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
        email: student.email,
        studentId: student.studentId,
        name: student.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        role: "student"
      }
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in."
    });
  }
};

// =====================================
// EXPORT FUNCTIONS
// =====================================

// =====================================
// GET CURRENT STUDENT PROFILE (PROTECTED BY JWT)
// =====================================
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-passwordHash");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        role: "student"
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
  registerStudent,
  loginStudent,
  getStudentProfile
};
