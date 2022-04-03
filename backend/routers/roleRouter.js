/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Role from "../models/RoleModel";

const roleRouter = express.Router();

roleRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    await Role.deleteMany({});
    const createdRoles = await Role.insertMany(data.roles);
    res.send({ createdRoles });
  })
);

export default roleRouter;
