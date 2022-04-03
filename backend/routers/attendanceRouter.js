/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Attendance from "../models/AttendanceModel";

const attendanceRouter = express.Router();

attendanceRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const attendances = {
      type: req.body.type,
      teacher: req.body.teacher,
      matter: req.body.matter,
      student: req.body.student,
      classRoom: req.body.classRoom,
    };

    const attendance = new Attendance(attendances);
    const createdAttendances = await attendance.save();

    res
      .status(201)
      .send({ message: "New Student Created", student: createdAttendances });
  })
);

attendanceRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const attendance = await Attendance.findById(req.params.id);
    if (attendance) {
      attendance.type = req.body.type || attendance.type;
      attendance.teacher = req.body.teacher || attendance.teacher;
      attendance.matter = req.body.matter || attendance.matter;
      attendance.student = req.body.student || attendance.student;
      attendance.classRoom = req.body.classRoom || attendance.classRoom;

      const updatedAttendance = await attendance.save();
      res.send({
        message: "Updated Attendance",
        attendance: updatedAttendance,
      });
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

attendanceRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const attendance = await Attendance.findById(req.params.id);
    if (attendance) {
      const deleteAttendance = await attendance.remove();
      res.send({ message: "Attendance Deleted", attendance: deleteAttendance });
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

attendanceRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      res.send(attendance);
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

attendanceRouter.get(
  "/attendance-of-a-class/:classRoom",
  expressAsyncHandler(async (req, res) => {
    const attendance = await Attendance.find({
      classRoom: req.params.classRoom,
    })
      .sort({ createdAt: -1 })
      .populate("student");

    if (attendance) {
      res.send(attendance);
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

export default attendanceRouter;
