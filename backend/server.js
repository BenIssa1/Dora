/** @format */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import classRoomRouter from "./routers/classRoomRouter";
import matterRouter from "./routers/matterRouter";
import establishmentRouter from "./routers/establishmentRouter";
import userRouter from "./routers/userRouter";
import roleRouter from "./routers/roleRouter";
import studentRouter from "./routers/studentRouter";
import noteRouter from "./routers/notetRouter";
import trimesterRouter from "./routers/trimesterRouter";
import attendanceRouter from "./routers/attendanceRouter";
import teacherRouter from "./routers/teacherRouter";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://issa:issa0522@cluster0.mtu3s.mongodb.net/dora-school?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// ClassRooms
app.use("/api/class-room", classRoomRouter);
// Mattes
app.use("/api/matter", matterRouter);
// Establisments
app.use("/api/establishment", establishmentRouter);
// Establisments
app.use("/api/role", roleRouter);
// Users
app.use("/api/users", userRouter);
// Students
app.use("/api/students", studentRouter);
// Notes
app.use("/api/notes", noteRouter);
// Trimester
app.use("/api/trimester", trimesterRouter);
// Trimester
app.use("/api/attendances", attendanceRouter);
// Trimester
app.use("/api/teachers", teacherRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
