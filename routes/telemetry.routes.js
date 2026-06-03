import express from "express";

import * as telemetryController from "../controllers/telemetry.controllers.js";
import { verifyInternalOrJWT } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(10), telemetryController.getAllLockersTelemetry)
    .post(verifyInternalOrJWT, deleteCache('/telemetry'), telemetryController.createLockerTelemetry)
router.route('/:id')
    .get(verifyInternalOrJWT, telemetryController.getLockerTelemetry)

export default router;