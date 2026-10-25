const mongoose = require("mongoose");

const similarityReportSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: false
    },

    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: false
    },

    studentA: {
      type: String,
      default: ""
    },

    studentB: {
      type: String,
      default: ""
    },

    similarityPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    matchedText: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "LOW", "MEDIUM", "HIGH"],
      default: "Completed"
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "SimilarityReport",
  similarityReportSchema
);