import express from "express";
import * as citizensController from "../controllers/citizens.controllers.js";
import { verifyJWT, requireRoles} from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/:contacto")
  .get(citizensController.getCitizen)
  .delete(verifyJWT, requireRoles('admin'), citizensController.deleteCitizen);

router.route("/:contacto/suspense")
  .patch(verifyJWT, requireRoles('admin'),citizensController.updateCitizenSuspense);

export default router;
