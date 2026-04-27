import express from "express";

import * as telemetryController from "../controllers/telemetry.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id')
    .get()

export default router;