import express from "express";
import * as entitiesController from "../controllers/entities.controllers.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/:nif_nipc")
  .delete(verifyJWT, adminOrSelf, entitiesController.deleteEntity);

router.route("/:nif_nipc/block")
  .patch(verifyJWT, requireRoles("admin"), entitiesController.updateEntityBlocked);

router.route("/:nif_nipc/profile")
  .patch(verifyJWT, adminOrSelf, entitiesController.updateEntityProfile);

export default router;
