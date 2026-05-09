import express from "express";
import * as citizensController from "../controllers/citizens.controllers.js";

const router = express.Router();

router.route("/:contacto")
  .get(citizensController.getCitizen)
  .delete(citizensController.deleteCitizen);

router.route("/:contacto/suspense")
  .patch(citizensController.updateCitizenSuspense);

export default router;
