/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Note from "../models/NoteModel";
import QuarterAverage from "../models/QuarterAverageModel";
import OverallAverage from "../models/OverallAverageModel";
import { isAuth, isVerifiedAndIsVerifiedCredentials } from "../utils";
import AddAverage from "../models/AddAverageModel";
import Student from "../models/StudentModel";
import Notification from "../models/NotificationModel";

const noteRouter = express.Router();

// Donner une note
noteRouter.post(
  "/",
  isAuth,
  isVerifiedAndIsVerifiedCredentials,
  expressAsyncHandler(async (req, res) => {
    const noteValues = {
      trimester: req.body.trimester,
      noteType: req.body.noteType,
      note: req.body.note,
      teacher: req.user.teacherDatas._id,
      matter: req.user.teacherDatas.matter._id,
      student: req.body.student,
    };

    // create student note
    const note = new Note(noteValues);
    const createdNote = await note.save();

    const noteValue =
      req.body.noteType === "Interrogation"
        ? `${req.body.note}/10`
        : `${req.body.note}/20`;

    // Create Notification

    let now = new Date();
    let date =
      now.getFullYear() + "-" + `${now.getMonth() + 1}` + "-" + now.getDate();
    let hours = now.getHours() + ":" + now.getMinutes();

    const studentData = await Student.findById(noteValues.student);

    if (studentData) {
      const notification = new Notification({
        message: `Votre enfant a eu ${noteValue} en ${
          req.body.noteType === "Interrogation" ? "Interrogation" : "Devoir"
        } en ${req.user.teacherDatas.matter.name}`,
        user_id: studentData.parent,
        date,
        hours,
      });
      await notification.save();
    }

    res
      .status(201)
      .send({ message: "New Note Created", note: createdNote, noteValue });

    // create student avearge
    const { trimester, student } = req.body;
    const teacher = req.user.teacherDatas._id;
    const matter = req.user.teacherDatas.matter._id;

    const quarterAverage = await QuarterAverage.findOne({
      student,
      matter,
      trimester,
    });

    const addAverage = await AddAverage.findOne({
      trimester,
      matter,
      teacher,
    });

    let addAverageValue = 0;

    if (addAverage) {
      addAverageValue = addAverage.value;
    }

    if (quarterAverage) {
      calculQuarterAverage(student, matter, trimester).then(async (average) => {
        quarterAverage.average =
          parseFloat(average) +
          parseFloat(Number.parseFloat(addAverageValue).toFixed(2));
        await quarterAverage.save();
      });
    } else {
      calculQuarterAverage(student, matter, trimester).then(async (average) => {
        console.log(average + addAverageValue);
        const quarterAverage = new QuarterAverage({
          average:
            parseFloat(average) +
            parseFloat(Number.parseFloat(addAverageValue).toFixed(2)),
          teacher,
          matter,
          student,
          trimester,
        });
        await quarterAverage.save();
      });
    }

    const overallAverages = await OverallAverage.findOne({
      student,
      trimester,
    });

    if (overallAverages) {
      calculOverallAverage(student, trimester).then(async (average) => {
        overallAverages.average = average;
        await overallAverages.save();
      });
    } else {
      calculOverallAverage(student, trimester).then(async (average) => {
        const quarterAverage = new OverallAverage({
          average,
          student,
          trimester,
        });
        await quarterAverage.save();
      });
    }
  })
);

// Modifier une note
noteRouter.put(
  "/:id",
  isAuth,
  isVerifiedAndIsVerifiedCredentials,
  expressAsyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
      note.trimester = req.body.trimester || note.trimester;
      note.noteType = req.body.noteType || note.noteType;
      note.note = req.body.note || note.note;
      note.student = req.body.student || note.student;

      const updatedNote = await note.save();
      res.send({ message: "Updated note Student", note: updatedNote });

      let student = note.student;
      let matter = note.matter;
      let trimester = note.trimester;

      const quarterAverage = await QuarterAverage.findOne({
        student,
        matter,
        trimester,
      });

      if (quarterAverage) {
        calculQuarterAverage(student, matter, trimester).then(
          async (average) => {
            quarterAverage.average = average;
            await quarterAverage.save();
          }
        );
      }

      const overallAverages = await OverallAverage.findOne({
        student: student,
        trimester: trimester,
      });

      if (overallAverages) {
        calculOverallAverage(student, trimester).then(async (average) => {
          overallAverages.average = average;
          await overallAverages.save();
        });
      }
    } else {
      res.status(404).send({ message: "Student notes not Not Found" });
    }
  })
);

// Supprimer une note
noteRouter.delete(
  "/:id",
  isAuth,
  isVerifiedAndIsVerifiedCredentials,
  expressAsyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
      let student = note.student;
      let matter = note.matter;
      let trimester = note.trimester;

      await note.remove();
      res.send({ message: "Deleted note Student" });

      const quarterAverage = await QuarterAverage.findOne({
        student,
        matter,
        trimester,
      });

      if (quarterAverage) {
        calculQuarterAverage(student, matter, trimester).then(
          async (average) => {
            if (!average) {
              await quarterAverage.remove();
            } else {
              quarterAverage.average = average;
              await quarterAverage.save();
            }
          }
        );
      }

      const overallAverages = await OverallAverage.findOne({
        student: student,
        trimester: trimester,
      });

      if (overallAverages) {
        calculOverallAverage(student, trimester).then(async (average) => {
          if (!average) {
            await overallAverages.remove();
          } else {
            overallAverages.average = average;
            await overallAverages.save();
          }
        });
      }
    } else {
      res.status(404).send({ message: "Student not Not Found" });
    }
  })
);

// Donner plus aux eleves
noteRouter.post(
  "/add-average",
  isAuth,
  isVerifiedAndIsVerifiedCredentials,
  expressAsyncHandler(async (req, res) => {
    const noteValues = {
      trimester: req.body.trimester,
      value: req.body.value,
      teacher: req.user.teacherDatas._id,
      matter: req.user.teacherDatas.matter._id,
      establishment: req.user.teacherDatas.establishment._id,
      classRoom: req.body.classRoom,
    };

    // create add average
    const addAverage = new AddAverage(noteValues);
    const createdAddAverage = await addAverage.save();

    res
      .status(201)
      .send({ message: "New Add Avearge Created", createdAddAverage });

    const { classRoom, trimester, value } = req.body;
    const establishment = noteValues.establishment;
    const matter = noteValues.matter;

    const students = await Student.find({
      establishment,
      classRoom,
    });

    students.map(async (student) => {
      if (student) {
        const quarterAverage = await QuarterAverage.findOne({
          student: student._id,
          matter,
          trimester,
        });

        if (quarterAverage) {
          quarterAverage.average = quarterAverage.average + value;
          await quarterAverage.save();

          const overallAverages = await OverallAverage.findOne({
            student: student._id,
            trimester,
          });

          calculOverallAverage(student, trimester).then(async (average) => {
            overallAverages.average = average;
            await overallAverages.save();
          });
        }
      }
    });
  })
);

const calculQuarterAverage = async (student, matter, trimester) => {
  const notes = await Note.find({
    student,
    matter,
    trimester,
  });

  let totalAverage = 0;
  let totalDivisible = 0;

  if (notes.length > 0) {
    notes.map((note) => {
      totalAverage += note.note;

      if (note.noteType === "Interrogation") {
        totalDivisible += 0.5;
      } else {
        totalDivisible += 1;
      }
    });
    return (totalAverage / totalDivisible).toFixed(2);
  }
  return false;
};

const calculOverallAverage = async (student, trimester) => {
  let totalAverage = 0;
  let totalDivisible = 0;

  const averages = await QuarterAverage.find({
    student,
    trimester,
  });

  if (averages.length > 0) {
    averages.map((average) => {
      totalAverage += average.average * 1;
      totalDivisible += 1;
    });

    return (totalAverage / totalDivisible).toFixed(2);
  }
  return false;
};

export default noteRouter;
