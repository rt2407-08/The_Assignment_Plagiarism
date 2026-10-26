const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: "instructor",
      enum: ["instructor"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Instructor", instructorSchema);
