import express from "express";

import * as telemetryController from "../controllers/telemetry.controllers.js";
import { verifyInternalOrJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, telemetryController.getAllLockersTelemetry)
    .post(verifyInternalOrJWT, telemetryController.createLockerTelemetry)
router.route('/:id')
    .get(verifyInternalOrJWT, telemetryController.getLockerTelemetry)

export default router;