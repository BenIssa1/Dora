/** @format */

import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    matter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matter",
      required: true,
    },
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Establishment",
      required: true,
    },
    classRoom: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classRoom",
        required: true,
      },
    ],
    solde: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
