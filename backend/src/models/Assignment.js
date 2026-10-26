
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "code"],
      default: "text"
    },
    language: {
      type: String,
      default: null
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    minWords: {
      type: Number,
      default: 0
    },
    maxWords: {
      type: Number,
      default: 10000
    }
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    assignmentCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },

    questions: {
      type: [questionSchema],
      default: []
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: false
    },

    instructorName: {
      type: String,
      default: ""
    },

    instructorEmail: {
      type: String,
      default: ""
    },

    minWords: {
      type: Number,
      default: 0
    },

    maxWords: {
      type: Number,
      default: 10000
    },

    similarityThreshold: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },

    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
