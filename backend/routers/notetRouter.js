/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Note from "../models/NoteModel";
import QuarterAverage from "../models/QuarterAverageModel";
import OverallAverage from "../models/OverallAverageModel";

const noteRouter = express.Router();

noteRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const noteValues = {
      trimester: req.body.trimester,
      noteType: req.body.noteType,
      coefficient: req.body.coefficient,
      note: req.body.note,
      isTen: req.body.isTen,
      teacher: req.body.teacher,
      matter: req.body.matter,
      student: req.body.student,
    };

    // create student note
    const note = new Note(noteValues);
    const createdNote = await note.save();

    res.status(201).send({ message: "New Note Created", note: createdNote });

    // create student avearge
    const { matter, trimester, student, coefficient, teacher } = req.body;
    const quarterAverage = await QuarterAverage.findOne({
      student,
      matter,
      trimester,
    });

    if (quarterAverage) {
      calculQuarterAverage(student, matter, trimester).then(async (average) => {
        quarterAverage.average = average;
        await quarterAverage.save();
      });
    } else {
      calculQuarterAverage(student, matter, trimester).then(async (average) => {
        const quarterAverage = new QuarterAverage({
          average,
          coefficient,
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

noteRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
      note.trimester = req.body.trimester || note.trimester;
      note.noteType = req.body.noteType || note.noteType;
      note.coefficient = req.body.coefficient || note.coefficient;
      note.note = req.body.note || note.note;
      note.isTen = req.body.isTen || note.isTen;
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
      res.status(404).send({ message: "Student not Not Found" });
    }
  })
);

noteRouter.delete(
  "/:id",
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

      if (note.isTen) {
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
      totalAverage += average.average * average.coefficient;
      totalDivisible += average.coefficient;
    });

    return (totalAverage / totalDivisible).toFixed(2);
  }
  return false;
};

export default noteRouter;
