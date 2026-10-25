
const mongoose = require("mongoose");
const SimilarityReport = require("../models/SimilarityReport");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const { generateAssignmentReport } = require("../utils/ngramSimilarity");

// Create a similarity report
const createSimilarityReport = async (req, res) => {
  try {
    const { submissionId, similarityPercentage, matchedText } = req.body;

    if (
      !submissionId ||
      similarityPercentage === undefined ||
      similarityPercentage === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide submissionId and similarityPercentage"
      });
    }

    if (
      typeof similarityPercentage !== "number" ||
      similarityPercentage < 0 ||
      similarityPercentage > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Similarity percentage must be a number between 0 and 100"
      });
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const report = await SimilarityReport.create({
      submissionId,
      similarityPercentage,
      matchedText
    });

    return res.status(201).json({
      success: true,
      message: "Similarity report created successfully",
      report
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all similarity reports
const getAllSimilarityReports = async (req, res) => {
  try {
    const reports = await SimilarityReport.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reports for a particular submission
const getReportBySubmission = async (req, res) => {
  try {
    const reports = await SimilarityReport.find({
      submissionId: req.params.submissionId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ===============================================================
// GET ASSIGNMENT SIMILARITY REPORT (RUNS N-GRAM SERVER-SIDE)
// GET /api/assignments/:id/similarity-report
// ===============================================================
const getAssignmentSimilarityReport = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.isValidObjectId(id)) {
      query = { _id: id };
    } else {
      query = { assignmentCode: String(id).trim().toUpperCase() };
    }

    const assignment = await Assignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    // Fetch all submissions for this assignment
    const submissions = await Submission.find({
      assignmentId: assignment._id
    }).sort({ createdAt: -1 });

    // Run n-gram Jaccard algorithm server-side
    const report = generateAssignmentReport(assignment, submissions);

    // Persist top flagged pairs in SimilarityReport collection in MongoDB
    if (report.pairs && report.pairs.length > 0) {
      for (const pair of report.pairs.slice(0, 10)) {
        try {
          await SimilarityReport.findOneAndUpdate(
            {
              assignmentId: assignment._id,
              studentA: pair.studentA,
              studentB: pair.studentB
            },
            {
              assignmentId: assignment._id,
              studentA: pair.studentA,
              studentB: pair.studentB,
              similarityPercentage: pair.similarity,
              status: pair.status,
              details: pair.questionDetails
            },
            { upsert: true, returnDocument: 'after' }
          );
        } catch (saveErr) {
          // Non-blocking persistence
        }
      }
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error("Server-side similarity report error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSimilarityReport,
  getAllSimilarityReports,
  getReportBySubmission,
  getAssignmentSimilarityReport
};
