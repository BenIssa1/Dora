/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Attendance from "../models/AttendanceModel";
import AttendanceHistorique from "../models/AttendancesHistoriqueModel";
import Matter from "../models/MatterModel";
import Notification from "../models/NotificationModel";
import Student from "../models/StudentModel";

const attendanceRouter = express.Router();

attendanceRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    let now = new Date();
    let date =
      now.getFullYear() + "-" + `${now.getMonth() + 1}` + "-" + now.getDate();
    let hours = now.getHours() + ":" + now.getMinutes();

    let presences = [];
    let absences = [];
    let malades = [];
    let retards = [];

    const { teacher, matter, classRoom, students } = req.body;

    for (let index = 0; index < students.length; index++) {
      const element = students[index];

      const attendanceData = {
        type: element.type,
        teacher: teacher,
        matter: matter,
        student: element.id,
        classRoom: classRoom,
        date,
        hours,
      };

      const attendance = new Attendance(attendanceData);
      const createdAttendance = await attendance.save();

      if (createdAttendance.type === "Present") {
        presences.push(createdAttendance);
      } else if (createdAttendance.type === "Absent") {
        absences.push(createdAttendance);
      } else if (createdAttendance.type === "Malade") {
        malades.push(createdAttendance);
      } else if (createdAttendance.type === "Retard") {
        retards.push(createdAttendance);
      }

      // Create student notification for attendance
      const studentData = await Student.findById(element.id);
      const matterData = await Matter.findById(matter);

      if (studentData && matterData) {
        const notification = new Notification({
          message: `Votre enfant a ete  ${
            createdAttendance.type !== "Retard"
              ? createdAttendance.type
              : `en ${createdAttendance.type}`
          } au ${matterData.name} a ${hours}`,
          user_id: studentData.parent,
          date,
          hours,
        });
        await notification.save();
      }
    }

    res.status(201).send({
      message: "New Attendances Created",
      presences: presences.length,
      absences: absences.length,
      retards: retards.length,
      malades: malades.length,
      date,
      hours,
    });

    const attendanceHistorique = new AttendanceHistorique({
      teacher: teacher,
      matter: matter,
      classRoom: classRoom,
      date,
      hours,
      attendance: presences.length,
      absence: absences.length,
      delay: retards.length,
      sick: malades.length,
    });
    await attendanceHistorique.save();
  })
);

attendanceRouter.put(
  "/",
  expressAsyncHandler(async (req, res) => {
    let presences = [];
    let absences = [];
    let malades = [];
    let retards = [];

    const { students, attendanceHistoriqueId } = req.body;

    for (let index = 0; index < students.length; index++) {
      const element = students[index];

      const attendance = await Attendance.findById(element.id);
      attendance.type = element.type;
      const updatedAttendance = await attendance.save();

      if (updatedAttendance.type === "Present") {
        presences.push(updatedAttendance);
      } else if (updatedAttendance.type === "Absent") {
        absences.push(updatedAttendance);
      } else if (updatedAttendance.type === "Malade") {
        malades.push(updatedAttendance);
      } else if (updatedAttendance.type === "Retard") {
        retards.push(updatedAttendance);
      }
    }

    const attendanceHistorique = await AttendanceHistorique.findById(
      attendanceHistoriqueId
    );

    attendanceHistorique.attendance = presences.length;
    attendanceHistorique.absence = absences.length;
    attendanceHistorique.delay = retards.length;
    attendanceHistorique.sick = malades.length;

    await attendanceHistorique.save();

    res.status(201).send({
      message: "Attendances Updated",
      presences: presences.length,
      absences: absences.length,
      retards: retards.length,
      malades: malades.length,
    });
  })
);

attendanceRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const attendancesHistorique = await AttendanceHistorique.findById(
      req.params.id
    );
    if (attendancesHistorique) {
      const deleteAttendance = await attendancesHistorique.remove();

      const attendancesStudents = await Attendance.find({
        teacher: deleteAttendance.teacher,
        classRoom: deleteAttendance.classRoom,
        date: deleteAttendance.date,
        hours: deleteAttendance.hours,
      });

      res.send({
        message: "Attendance Historique Deleted",
        attendance: deleteAttendance,
      });

      for (let index = 0; index < attendancesStudents.length; index++) {
        const attendance = attendancesStudents[index];
        await attendance.remove();
      }
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

attendanceRouter.get(
  "/attendance-historique/:id",
  expressAsyncHandler(async (req, res) => {
    const attendancesHistorique = await AttendanceHistorique.findById(
      req.params.id
    );

    if (attendancesHistorique) {
      const attendancesStudents = await Attendance.find({
        teacher: attendancesHistorique.teacher,
        classRoom: attendancesHistorique.classRoom,
        date: attendancesHistorique.date,
        hours: attendancesHistorique.hours,
      }).populate("student");

      res.send({
        attendances: attendancesStudents,
      });
    } else {
      res.status(404).send({ message: "Attendance Not Found" });
    }
  })
);

export default attendanceRouter;
