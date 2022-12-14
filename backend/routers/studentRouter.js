/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Student from "../models/StudentModel";
import Note from "../models/NoteModel";
import OverallAverage from "../models/OverallAverageModel";
import QuarterAverage from "../models/QuarterAverageModel";
import { isAuth, isParent, isVerified, isTeacherOrIsParent } from "../utils";
import Notification from "../models/NotificationModel";
import Teacher from "../models/TeacherModel";
import User from "../models/UserModel";

const studentRouter = express.Router();

// path for static verified page
import path from "path";
import Abonnement from "../models/AbonnementModel";
const __dirname = path.resolve();

// Cree un eleve
studentRouter.post(
  "/",
  // isAuth,
  // isVerified,
  // isParent,
  expressAsyncHandler(async (req, res) => {
    const { returnContext, responcecode, referenceNumber } = req.query;
    const context = JSON.parse(returnContext);

    const user = await User.findOne({ _id: context.userId });

    // verifie est-ce que le parent a un compte utilisateur
    if (user) {
      // verifie est-ce que l'eleve n'existe pas deja
      const student = await Student.findOne({
        matricule: context.studentDatas.matricule,
      });

      // si l'eleve existe. je fais une redirection vers une page
      if (student) {
        let message = `Eleve existe deja`;
        res.redirect(`/api/students/verified?error=true&message=${message}`);
      } else {
        // verifie est-ce que la reference number existe pour mieux me rassurer que l'eleve n'existe pas
        const studentReference = await Student.findOne({
          referenceNumber: referenceNumber,
        });

        // si l'eleve existe. je fais une redirection vers une page
        if (studentReference) {
          let message = `Eleve existe deja`;
          res.redirect(`/api/students/verified?error=true&message=${message}`);
        } else {
          // verifie est-ce que la responcecode est bon avant d'ajouter l'eleve
          if (responcecode == "0") {
            // logique date d'expiration
            let newDate = new Date();

            const abonnement = await Abonnement.findById(studentDatas.type);

            if (abonnement.name == "Mensuel") {
              newDate.setMonth(newDate.getMonth() + 1);
            } else if (abonnement.name == "Trimestriel") {
              newDate.setMonth(newDate.getMonth() + 3);
            } else {
              newDate.setMonth(newDate.getMonth() + 10);
            }

            studentDatas.dateExp =
              `${newDate.getMonth() + 1}` +
              "/" +
              newDate.getDate() +
              "/" +
              newDate.getFullYear();

            const studentDatas = context.studentDatas;
            const student = new Student(studentDatas);
            const createdStudent = await student.save();

            res.status(201).send({
              message: "New Student Created",
              student: createdStudent,
            });

            const teachers = await Teacher.find({
              establishment: context.studentDatas.establishment,
            });

            // Paiement des enseignants

            const teacherDatas = [];

            for (
              let indexTeacher = 0;
              indexTeacher < teachers.length;
              indexTeacher++
            ) {
              const teacher = teachers[indexTeacher];

              for (
                let indexClassroom = 0;
                indexClassroom < teacher.classRoom.length;
                indexClassroom++
              ) {
                const classroom = teacher.classRoom[indexClassroom];

                if (req.body.classRoom == classroom) {
                  teacher.solde += 175;
                  await teacher.save();

                  teacherDatas.push(teacher);
                }
              }
            }

            res.redirect(`/api/students/verified`);
          } else {
            let message = `Une erreur lors de la validation du paiement de votre enfant. Ref : ${referenceNumber}`;
            res.redirect(
              `/api/students/verified?error=true&message=${message}`
            );
          }
        }
      }
    } else {
      let message = `Cet utlisatuer n'existe pas`;
      res.redirect(`/api/students/verified?error=true&message=${message}`);
    }
  })
);

studentRouter.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/verifiedPayment.html"));
});

// Recuperer les eleves du parent
studentRouter.get(
  "/parent",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    let now = new Date();
    let date =
      `${now.getMonth() + 1}` + "/" + now.getDate() + "/" + now.getFullYear();
    let studentsParent = [];

    const students = await Student.find({ parent: req.user._id });

    for (let index = 0; index < students.length; index++) {
      const student = students[index];

      let newDate = new Date(student.dateExp);
      let newAr = {};

      if (new Date(date) < newDate) {
        newAr = { student, isShow: true };
      } else {
        newAr = { student, isShow: false };
      }

      studentsParent.push(newAr);
    }

    res.send(studentsParent);
  })
);

// Recuperer les notifications du parent connecte
studentRouter.get(
  "/notifications",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user_id: req.user._id });

    res.send(notifications);
  })
);

// Modifier les informations d'un eleve
studentRouter.put(
  "/:id",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
      student.firstName = req.body.firstName || student.firstName;
      student.lastName = req.body.lastName || student.lastName;
      student.establishment = req.body.establishment || student.establishment;
      student.classRoom = req.body.classRoom || student.classRoom;

      const updatedStudent = await student.save();
      res.send({ message: "Updated Student", order: updatedStudent });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

// Supprimer un eleve
studentRouter.delete(
  "/:id",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
      const deleteStudent = await student.remove();
      res.send({ message: "Student Deleted", student: deleteStudent });
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

// Recuperer un eleve
studentRouter.get(
  "/:id",
  isAuth,
  isVerified,
  isTeacherOrIsParent,
  expressAsyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
      res.send(student);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

// Recuperer la moyenne generale de l'eleve
studentRouter.get(
  "/overall-average/:student",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    const averages = await OverallAverage.find({
      student: req.params.student,
    }).populate("trimester");
    let firstTrimesterAvearge = 0;
    let secondTrimesterAvearge = 0;
    let thirdTrimesterAvearge = 0;
    let totalAverage = 0;
    let totalDivisible = 0;

    if (averages.length > 0) {
      averages.map((average) => {
        if (average.trimester.name === "Trimestre 1") {
          firstTrimesterAvearge = average.average;
          totalAverage += average.average;
          totalDivisible += 1;
        } else if (average.trimester.name === "Trimestre 2") {
          secondTrimesterAvearge = average.average;
          totalAverage += average.average;
          totalDivisible += 1;
        } else if (average.trimester.name === "Trimestre 3") {
          thirdTrimesterAvearge = average.average;
          totalAverage += average.average;
          totalDivisible += 1;
        }
      });

      res.send({
        firstTrimesterAvearge,
        secondTrimesterAvearge,
        thirdTrimesterAvearge,
        overallAverage: totalAverage / totalDivisible,
      });
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

// Recuperer les moyennes d'une trimestre de l'eleve
studentRouter.get(
  "/quater-average/:trimester/:student",
  isAuth,
  isVerified,
  isParent,
  expressAsyncHandler(async (req, res) => {
    const quaterAverages = await QuarterAverage.find(
      {
        student: req.params.student,
        trimester: req.params.trimester,
      },
      { average: 1, matter: 1 }
    ).populate("matter");

    res.send(quaterAverages);
  })
);

// Recuperer les notes d'une matiere en fonction du trimestre et de la matiere
studentRouter.get(
  "/matter-notes/:student/:trimester/:matter",
  isAuth,
  isVerified,
  isTeacherOrIsParent,
  expressAsyncHandler(async (req, res) => {
    const notes = await Note.find(
      {
        student: req.params.student,
        trimester: req.params.trimester,
        matter: req.params.matter,
      },
      { noteType: 1, note: 1, coefficient: 1 }
    );

    if (notes.length > 0) {
      res.send(notes);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

// Recuperer la moyenne d'une matiere en fonction du trimestre
studentRouter.get(
  "/quarter-average/:student/:trimester/:matter",
  isAuth,
  isVerified,
  isTeacherOrIsParent,
  expressAsyncHandler(async (req, res) => {
    const quaterAverages = await QuarterAverage.find({
      student: req.params.student,
      trimester: req.params.trimester,
      matter: req.params.matter,
    });

    res.send(quaterAverages);
  })
);

export default studentRouter;
