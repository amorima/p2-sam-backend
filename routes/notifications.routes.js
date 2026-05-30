import express from "express";
import * as notificationsController from "../controllers/notifications.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public legacy endpoints
router.route('/')
    .get(notificationsController.getAllNotification)
    .post(notificationsController.createNotification);

// Authenticated endpoints — specific paths before /:id to avoid ambiguity
router.get('/me/inbox', verifyJWT, notificationsController.getMyNotifications);
router.patch('/me/read-all', verifyJWT, notificationsController.markAllAsRead);
router.delete('/me/read-all', verifyJWT, notificationsController.deleteReadNotifications);
router.patch('/:id/read', verifyJWT, notificationsController.markAsRead);
router.delete('/:id', verifyJWT, notificationsController.deleteNotification);
router.get('/:id', notificationsController.getNotification);

export default router;
