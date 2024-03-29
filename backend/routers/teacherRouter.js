/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Teacher from "../models/TeacherModel";
import ClassRoom from "../models/ClassRoomModel";
import Student from "../models/StudentModel";
import NotificationPayment from "../models/NotificationPaymentModel";
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

teacherRouter.post(
  "/payment-retrait",
  isAuth,
  isTeacher,
  expressAsyncHandler(async (req, res) => {
    const { montant } = req.body;
    const { matter, establishment, solde, _id } = req.user.teacherDatas;

    if (montant > solde) {
      res.status(200).send({
        message: `Solde est insuffisant. voici le solde du compte : ${solde}`,
      });
    } else {
      const teacher = await Teacher.findById(_id);
      teacher.solde -= montant;
      await teacher.save();

      const notificationValues = {
        type: req.body.type,
        numero: req.body.numero,
        montant: req.body.montant,
        nom: req.user.lastName,
        prenom: req.user.firstName,
        matter: matter.name,
        establishment: establishment.name,
      };

      // create notification payment
      const notificationPayment = new NotificationPayment(notificationValues);
      const createdNotification = await notificationPayment.save();

      // Implementer le code de l'email

      res.status(200).send({
        message: `Successfully`,
        createdNotification,
      });
    }
  })
);

export default teacherRouter;
