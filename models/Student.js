const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true
    },
    className: {
      type: String,
      required: true
    },
    parentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
