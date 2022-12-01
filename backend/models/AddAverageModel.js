/** @format */

import mongoose from "mongoose";

const addAverageSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true },
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
    trimester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trimester",
      required: true,
    },
    classRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassRoom",
      required: true,
    },
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Establishment",
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

const AddAverage = mongoose.model("AddAverage", addAverageSchema);
export default AddAverage;
