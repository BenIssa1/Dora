/** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import Abonnement from "../models/AbonnementModel";
import Exemple from "../models/ExempleModel";

const exempleRouter = express.Router();

exempleRouter.get(
  "/create/:type",
  expressAsyncHandler(async (req, res) => {
    let newDate = new Date();

    let exempleDatas = { name: "Hello", type: "Test" };

    const abonnement = await Abonnement.findById(req.params.type);

    if (abonnement.name == "Mensuel") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (abonnement.name == "Trimestriel") {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setMonth(newDate.getMonth() + 10);
    }

    exempleDatas.dateExp =
      `${newDate.getMonth() + 1}` +
      "/" +
      newDate.getDate() +
      "/" +
      newDate.getFullYear();

    console.log(exempleDatas);

    const exemple = new Exemple(exempleDatas);
    const createdExemple = await exemple.save();
    res.send({ createdExemple });
  })
);

export default exempleRouter;
