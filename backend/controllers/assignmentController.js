
const Assignment = require("../models/Assignment");

// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      similarityThreshold,
      dueDate
    } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      similarityThreshold,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllAssignments,
  createAssignment
};
