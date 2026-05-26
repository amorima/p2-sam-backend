import express from "express";
import * as entitiesController from "../controllers/entities.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/:nif_nipc/block")
  .patch(verifyJWT, requireRoles("admin"), entitiesController.updateEntityBlocked);

export default router;
