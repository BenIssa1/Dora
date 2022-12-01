/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Teacher from "../models/TeacherModel";
import ClassRoom from "../models/ClassRoomModel";
import Student from "../models/StudentModel";
import { isAuth, isTeacher } from "../utils";

const teacherRouter = express.Router();

teacherRouter.get(
  "/students/:teacher",
  expressAsyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.teacher);
    let classRoomsId = null;
    let classRooms = [];
    let classRoomsDatas = [];

    if (teacher) {
      classRoomsId = teacher.classRoom;

      for (let index = 0; index < classRoomsId.length; index++) {
        const id = classRoomsId[index];
        const element = await ClassRoom.findById(id, { name: 1 });
        classRooms.push(element);
      }

      for (let index = 0; index < classRooms.length; index++) {
        const element = classRooms[index];

        const students = await Student.find({
          establishment: teacher.establishment,
          classRoom: element._id,
        });

        if (students.length > 0) {
          classRoomsDatas.push({
            className: element.name,
            students,
            count: students.length,
          });
        }
      }

      res.send(classRoomsDatas);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

teacherRouter.get(
  "/payment/:teacherId/:montant",
  expressAsyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.teacherId);
    if (teacher.solde > req.params.montant) {
      res.status(200).send({ message: "Successfully", teacher: teacher });
    } else {
      res
        .status(200)
        .send({ message: "Solde est insuffisant", teacher: teacher });
    }
  })
);

export default teacherRouter;
