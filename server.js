/** @format */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import classRoomRouter from "./backend/routers/classRoomRouter";
import matterRouter from "./backend/routers/matterRouter";
import establishmentRouter from "./backend/routers/establishmentRouter";
import userRouter from "./backend/routers/userRouter";
import studentRouter from "./backend/routers/studentRouter";
import noteRouter from "./backend/routers/notetRouter";
import trimesterRouter from "./backend/routers/trimesterRouter";
import attendanceRouter from "./backend/routers/attendanceRouter";
import teacherRouter from "./backend/routers/teacherRouter";

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

// mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/dora", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// ClassRooms
app.use("/api/class-room", classRoomRouter);
// Mattes
app.use("/api/matter", matterRouter);
// Establisments
app.use("/api/establishment", establishmentRouter);
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
