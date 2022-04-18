/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Trimester from "../models/TrimesterModel";

const trimesterRouter = express.Router();

trimesterRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await Trimester.deleteMany({});
    const createdTrimesters = await Trimester.insertMany(data.trimester);
    res.send({ createdTrimesters });
  })
);

trimesterRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const trimesters = await Trimester.find({});

    res.send(trimesters);
  })
);

export default trimesterRouter;
