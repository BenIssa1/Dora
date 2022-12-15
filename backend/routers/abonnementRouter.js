/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Abonnement from "../models/AbonnementModel";

const abonnementRouter = express.Router();

abonnementRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await Abonnement.deleteMany({});
    const createdAbonnements = await Abonnement.insertMany(data.abonnement);
    res.send({ createdAbonnements });
  })
);

abonnementRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const abonnements = await Abonnement.find({});

    res.send(abonnements);
  })
);

export default abonnementRouter;
