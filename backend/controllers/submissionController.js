
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

// Create a student submission (supports direct content and optional Multer file upload)
const createSubmission = async (req, res) => {
  try {
    let {
      assignmentId,
      studentName,
      studentId,
      content
    } = req.body;

    // Optional Multer file upload variant: extract file text if present
    if (req.file && req.file.buffer) {
      const fileText = req.file.buffer.toString("utf-8");
      if (content) {
        content = `${content}\n\n[Uploaded File: ${req.file.originalname}]\n${fileText}`;
      } else {
        content = fileText;
      }
    }

    if (!assignmentId || !studentName || !studentId || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide assignmentId, studentName, studentId, and content (or upload a file)"
      });
    }

    let assignment = null;
    if (mongoose.isValidObjectId(assignmentId)) {
      assignment = await Assignment.findById(assignmentId);
    }
    if (!assignment) {
      assignment = await Assignment.findOne({
        assignmentCode: String(assignmentId).trim().toUpperCase()
      });
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    const submission = await Submission.create({
      assignmentId: assignment._id,
      studentName: String(studentName).trim(),
      studentId: String(studentId).trim(),
      content: String(content).trim(),
      fileName: req.file ? req.file.originalname : undefined
    });

    return res.status(201).json({
      success: true,
      message: "Submission saved successfully",
      submission
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all submissions
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all submissions for a particular assignment
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const mongoose = require("mongoose");
    let targetId = assignmentId;

    if (!mongoose.isValidObjectId(assignmentId)) {
      const assignment = await Assignment.findOne({
        assignmentCode: assignmentId.trim().toUpperCase()
      });
      if (!assignment) {
        return res.status(200).json({
          success: true,
          count: 0,
          submissions: []
        });
      }
      targetId = assignment._id;
    }

    const submissions = await Submission.find({
      assignmentId: targetId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSubmission,
  getAllSubmissions,
  getSubmissionsByAssignment
};
