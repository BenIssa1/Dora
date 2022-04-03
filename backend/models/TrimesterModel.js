/** @format */

import mongoose from "mongoose";

const trimesterSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Trimester = mongoose.model("Trimester", trimesterSchema);
export default Trimester;
