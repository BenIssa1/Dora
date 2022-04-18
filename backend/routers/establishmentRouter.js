/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Establishment from "../models/EstablishmentModel";

const establishmentRouter = express.Router();

establishmentRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await Establishment.deleteMany({});
    const createdEstablishments = await Establishment.insertMany(
      data.establishments
    );
    res.send({ createdEstablishments });
  })
);

establishmentRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const establishments = await Establishment.find({});

    res.send(establishments);
  })
);

export default establishmentRouter;
