/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Note from "../models/NoteModel";
import Student from "../models/StudentModel";

const overallAverageRouter = express.Router();

export default overallAverageRouter;
