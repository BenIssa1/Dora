/** @format */

import mongoose from "mongoose";

const matterSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Matter = mongoose.model("Matter", matterSchema);
export default Matter;
