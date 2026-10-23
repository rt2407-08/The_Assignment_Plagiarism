
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

// Create a student submission
const createSubmission = async (req, res) => {
  try {
    const {
      assignmentId,
      studentName,
      studentId,
      content
    } = req.body;

    if (!assignmentId || !studentName || !studentId || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide assignmentId, studentName, studentId, and content"
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    const submission = await Submission.create({
      assignmentId,
      studentName,
      studentId,
      content
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

// Get all submissions for an assignment
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignmentId: req.params.assignmentId
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
  getSubmissionsByAssignment
};
