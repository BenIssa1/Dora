/** @format */

import mongoose from "mongoose";

const overallAverageSchema = new mongoose.Schema(
  {
    average: { type: Number, required: true },
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

const OverallAverage = mongoose.model("OverallAverage", overallAverageSchema);
export default OverallAverage;
