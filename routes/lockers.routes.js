import express from "express";

import * as lockersController from "../controllers/lockers.controllers.js";
import { verifyInternalOrJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// All locker endpoints accept the internal device key (X-Internal-Key) or a JWT,
// so the physical locker (Raspberry + Arduino) can talk to them directly.
router.route("/")
  .get(verifyInternalOrJWT, lockersController.getAllLockers);

router.post("/:id_locker/verify-pin", verifyInternalOrJWT, lockersController.verifyPin);
router.post("/:id_locker/confirm-deposit", verifyInternalOrJWT, lockersController.confirmDeposit);

router.route("/:id_locker/door")
  .get(verifyInternalOrJWT, lockersController.getDoor)
  .post(verifyInternalOrJWT, lockersController.updateDoor);

router.get("/:id_locker", verifyInternalOrJWT, lockersController.getLocker);

export default router;
