import express from "express";
import * as citizensController from "../controllers/citizens.controllers.js";
import { verifyJWT, requireRoles} from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/")
  .get(citizensController.getAllCitizens)
  .post(verifyJWT, requireRoles('admin'), citizensController.createCitizen);

router.route("/:contacto")
  .get(citizensController.getCitizen)
  .delete(verifyJWT, requireRoles('admin'), citizensController.deleteCitizen);

router.route("/:contacto/block")
  .patch(verifyJWT, requireRoles('admin'),citizensController.updateCitizenBlocked);

export default router;
