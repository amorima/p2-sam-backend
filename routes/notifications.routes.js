import express from "express";

import * as notificationsController from "../controllers/notifications.controllers.js";

const router = express.Router();

router.route('/')
    .get(notificationsController.getAllNotification)
    .post(notificationsController.createNotification)
router.get('/:id', notificationsController.getNotification)

export default router;