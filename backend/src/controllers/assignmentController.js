
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Instructor = require("../models/Instructor");

// =====================================
// GET ALL ASSIGNMENTS
// =====================================
const getAllAssignments = async (req, res) => {
  try {
    const filter = {};

    // Filter by instructor if specified
    if (req.query.instructorId || req.query.instructorEmail) {
      const orConditions = [];

      if (
        req.query.instructorId &&
        mongoose.isValidObjectId(req.query.instructorId)
      ) {
        orConditions.push({ instructorId: new mongoose.Types.ObjectId(req.query.instructorId) });
        orConditions.push({ instructorId: String(req.query.instructorId) });
      } else if (req.query.instructorId) {
        orConditions.push({ instructorId: String(req.query.instructorId) });
      }

      if (req.query.instructorEmail) {
        const cleanEmail = req.query.instructorEmail.trim().toLowerCase();
        orConditions.push({ instructorEmail: cleanEmail });
        const escaped = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        orConditions.push({ instructorEmail: new RegExp(`^${escaped}$`, "i") });
      }

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          assignments: []
        });
      }
    }

    const assignments = await Assignment.find(filter).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// GET ASSIGNMENT BY CODE
// =====================================
const getAssignmentByCode = async (req, res) => {
  try {
    const assignmentCode = req.params.code.trim().toUpperCase();

    const assignment = await Assignment.findOne({
      assignmentCode
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment code not found. Please check the code."
      });
    }

    return res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// CREATE ASSIGNMENT
// =====================================
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      assignmentCode,
      code,
      questions,
      similarityThreshold,
      dueDate,
      instructorId,
      instructorName,
      instructorEmail,
      minWords,
      maxWords
    } = req.body;

    // Validate title
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment title is required."
      });
    }

    // Validate questions
    if (questions !== undefined && !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions must be an array."
      });
    }

    const assignmentData = {
      title: title.trim(),
      description: description || "",
      questions: Array.isArray(questions) ? questions : [],
      minWords: minWords === undefined ? 0 : Number(minWords),
      maxWords: maxWords === undefined ? 10000 : Number(maxWords),
      similarityThreshold:
        similarityThreshold === undefined
          ? 30
          : Number(similarityThreshold),
      dueDate: dueDate || null,
      instructorName: typeof instructorName === "string" ? instructorName.trim() : "",
      instructorEmail: typeof instructorEmail === "string" ? instructorEmail.trim().toLowerCase() : ""
    };

    // Safely set instructorId if it is a valid ObjectId
    if (
      instructorId &&
      mongoose.isValidObjectId(instructorId)
    ) {
      assignmentData.instructorId = new mongoose.Types.ObjectId(instructorId);
    }

    // Auto-fill instructor details if only one of id or email was provided
    if (assignmentData.instructorId && (!assignmentData.instructorEmail || !assignmentData.instructorName)) {
      try {
        const inst = await Instructor.findById(assignmentData.instructorId);
        if (inst) {
          if (!assignmentData.instructorEmail) assignmentData.instructorEmail = (inst.email || "").toLowerCase();
          if (!assignmentData.instructorName) assignmentData.instructorName = inst.name || "";
        }
      } catch (err) {
        console.error("Could not fetch instructor by ID:", err);
      }
    } else if (assignmentData.instructorEmail && !assignmentData.instructorId) {
      try {
        const inst = await Instructor.findOne({ email: assignmentData.instructorEmail });
        if (inst) {
          assignmentData.instructorId = inst._id;
          if (!assignmentData.instructorName) assignmentData.instructorName = inst.name || "";
        }
      } catch (err) {
        console.error("Could not fetch instructor by email:", err);
      }
    }

    // Determine assignment code (use passed code or generate one)
    const rawCode = assignmentCode || code;
    if (typeof rawCode === "string" && rawCode.trim()) {
      assignmentData.assignmentCode = rawCode.trim().toUpperCase();
    } else {
      assignmentData.assignmentCode =
        "VT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const assignment = await Assignment.create(assignmentData);

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      assignment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This assignment code already exists."
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// UPDATE ASSIGNMENT
// =====================================
const updateAssignment = async (req, res) => {
  try {
    const { assignmentCode, questions } = req.body;
    const updateData = {};

    if (assignmentCode !== undefined) {
      if (
        typeof assignmentCode !== "string" ||
        !assignmentCode.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Assignment code cannot be empty."
        });
      }

      updateData.assignmentCode =
        assignmentCode.trim().toUpperCase();
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "Questions must be an array."
        });
      }

      updateData.questions = questions;
    }

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      assignment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This assignment code already exists."
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// DELETE ASSIGNMENT
// =====================================
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.isValidObjectId(id)) {
      query = { _id: id };
    } else {
      query = { assignmentCode: id.trim().toUpperCase() };
    }

    const assignment = await Assignment.findOneAndDelete(query);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found."
      });
    }

    // Also delete any submissions tied to this assignment
    await Submission.deleteMany({ assignmentId: assignment._id });

    return res.status(200).json({
      success: true,
      message: "Assignment and related submissions deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// EXPORT CONTROLLERS
// =====================================
module.exports = {
  getAllAssignments,
  getAssignmentByCode,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
