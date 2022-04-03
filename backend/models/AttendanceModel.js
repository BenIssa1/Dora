/** @format */

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    matter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matter",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassRoom",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuarterAverage = mongoose.model("Attendance", attendanceSchema);
export default QuarterAverage;
