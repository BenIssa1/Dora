/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import ClassRoom from "../models/ClassRoomModel";

const classRoomRouter = express.Router();

classRoomRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await ClassRoom.deleteMany({});
    const createdClassRooms = await ClassRoom.insertMany(data.classRooms);
    res.send({ createdClassRooms });
  })
);

export default classRoomRouter;
