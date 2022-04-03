/** @format */

import mongoose from "mongoose";

const classRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const ClassRoom = mongoose.model("ClassRoom", classRoomSchema);
export default ClassRoom;
