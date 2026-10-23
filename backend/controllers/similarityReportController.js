
const SimilarityReport = require("../models/SimilarityReport");
const Submission = require("../models/Submission");

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

// Get the report for a submission
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

module.exports = {
  createSimilarityReport,
  getReportBySubmission
};
