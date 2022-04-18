/** @format */

import mongoose from "mongoose";

const classRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Establishment",
    required: true,
  },
});

const ClassRoom = mongoose.model("ClassRoom", classRoomSchema);
export default ClassRoom;
