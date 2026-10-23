
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    studentId: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
