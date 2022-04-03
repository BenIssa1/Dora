/** @format */

import mongoose from "mongoose";

const EstablishmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Establishment = mongoose.model("Establishment", EstablishmentSchema);
export default Establishment;
