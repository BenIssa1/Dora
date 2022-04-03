/** @format */

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    noteType: { type: String, required: true },
    note: { type: Number, required: true },
    coefficient: { type: Number, required: true },
    isTen: { type: Boolean, default: false },
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

const Student = mongoose.model("Note", noteSchema);
export default Student;
