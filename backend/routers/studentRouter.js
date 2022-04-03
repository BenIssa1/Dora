/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Student from "../models/StudentModel";
import Note from "../models/NoteModel";
import OverallAverage from "../models/OverallAverageModel";
import QuarterAverage from "../models/QuarterAverageModel";

const studentRouter = express.Router();

studentRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const student = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      parent: req.body.parent,
      establishment: req.body.establishment,
      classRoom: req.body.classRoom,
    };

    const teacher = new Student(student);
    const createdTeacher = await teacher.save();

    res
      .status(201)
      .send({ message: "New Student Created", student: createdTeacher });
  })
);

studentRouter.put(
  "/:id",
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

studentRouter.delete(
  "/:id",
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

studentRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
      res.send(student);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

studentRouter.get(
  "/all/:establishment_id/:classRoom_id",
  expressAsyncHandler(async (req, res) => {
    const students = await Student.find(
      {
        establishment: req.params.establishment_id,
        classRoom: req.params.classRoom_id,
      },
      { firstName: 1, lastName: 1 }
    );

    if (students) {
      res.send(students);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

studentRouter.get(
  "/overall-average/:student",
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

studentRouter.get(
  "/quater-average/:student",
  expressAsyncHandler(async (req, res) => {
    const quaterAverages = await QuarterAverage.find(
      {
        student: req.params.student,
      },
      { average: 1, matter: 1 }
    ).populate("matter");

    if (quaterAverages.length > 0) {
      res.send(quaterAverages);
    } else {
      res.status(404).send({ message: "Student Not Found" });
    }
  })
);

studentRouter.get(
  "/matter-notes/:student/:trimester/:matter",
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

export default studentRouter;
