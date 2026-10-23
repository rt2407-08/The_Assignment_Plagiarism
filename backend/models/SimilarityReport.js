const mongoose = require("mongoose");

const similarityReportSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true
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
      enum: ["Pending", "Completed"],
      default: "Completed"
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