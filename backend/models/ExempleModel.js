/** @format */

import mongoose from "mongoose";

const exempleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateExp: { type: String, required: true },
});

const Exemple = mongoose.model("Exemple", exempleSchema);
export default Exemple;
