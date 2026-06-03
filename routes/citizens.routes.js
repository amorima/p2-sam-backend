import express from "express";
import * as citizensController from "../controllers/citizens.controllers.js";
import { verifyJWT, requireRoles} from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route("/")
  .get(setCache(60, null, 'public'), citizensController.getAllCitizens)
  .post(verifyJWT, requireRoles('admin'), deleteCache('/citizens'), citizensController.createCitizen);

router.route("/:contacto")
  .get(citizensController.getCitizen)
  .delete(verifyJWT, requireRoles('admin'), deleteCache('/citizens'), citizensController.deleteCitizen);

router.route("/:contacto/block")
  .patch(verifyJWT, requireRoles('admin'), deleteCache('/citizens'), citizensController.updateCitizenBlocked);

export default router;
