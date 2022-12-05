/** @format */

import mongoose from "mongoose";

const notificationPaymentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  numero: {
    type: String,
    required: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  matter: {
    type: String,
    required: true,
  },
  establishment: {
    type: String,
    required: true,
  },
});

const NotificationPayment = mongoose.model(
  "NotificationPayment",
  notificationPaymentSchema
);
export default NotificationPayment;
