import express from "express";

import * as notificationsController from "../controllers/notifications.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.get('/:id')

export default router;