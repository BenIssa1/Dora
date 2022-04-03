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

export default establishmentRouter;
