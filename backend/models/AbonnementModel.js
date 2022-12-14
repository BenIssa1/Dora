/** @format */

import mongoose from "mongoose";

const abonnementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
});

const Abonnement = mongoose.model("Abonnement", abonnementSchema);
export default Abonnement;
