import express from "express";

import * as telemetryController from "../controllers/telemetry.controllers.js";

const router = express.Router();

router.route('/')
    .get(telemetryController.getAllLockersTelemetry)
    .post(telemetryController.createLockerTelemetry)
router.route('/:id')
    .get(telemetryController.getLockerTelemetry)

export default router;