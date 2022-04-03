/** @format */

import mongoose from "mongoose";

const quarterAverageSchema = new mongoose.Schema(
  {
    average: { type: Number, required: true },
    coefficient: { type: Number, required: true },
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
    trimester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trimester",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuarterAverage = mongoose.model("QuarterAverage", quarterAverageSchema);
export default QuarterAverage;
