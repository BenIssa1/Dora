/** @format */

import mongoose from "mongoose";

const attendanceHistoriqueSchema = new mongoose.Schema({
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
  classRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassRoom",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
  attendance: {
    type: Number,
    required: true,
  },
  sick: {
    type: Number,
    required: true,
  },
  delay: {
    type: Number,
    required: true,
  },
  absence: {
    type: Number,
    required: true,
  },
});

const attendanceHistorique = mongoose.model(
  "AttendancesHistorique",
  attendanceHistoriqueSchema
);
export default attendanceHistorique;
