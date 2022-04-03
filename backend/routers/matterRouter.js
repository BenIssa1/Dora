/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Matter from "../models/MatterModel";

const matterRouter = express.Router();

matterRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await Matter.deleteMany({});
    const createdMatters = await Matter.insertMany(data.matters);
    res.send({ createdMatters });
  })
);

export default matterRouter;
