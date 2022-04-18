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

classRoomRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const classRoomDatas = {
      name: req.body.name,
      establishment: req.body.establishment,
    };

    const classRoom = new ClassRoom(classRoomDatas);
    const createdClassRoom = await classRoom.save();

    res
      .status(201)
      .send({ message: "New ClassRoom Created", classRooms: createdClassRoom });
  })
);

classRoomRouter.get(
  "/establishment/:establishment",
  expressAsyncHandler(async (req, res) => {
    const establishment = req.params.establishment;
    const establishmentClassRoom = await ClassRoom.find({ establishment });

    if (establishmentClassRoom) {
      res.send(establishmentClassRoom);
    } else {
      res.status(404).send({ message: "Establishment classRooms Not Found" });
    }
  })
);

export default classRoomRouter;
