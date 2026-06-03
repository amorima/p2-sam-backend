import express from "express";
import * as notificationsController from "../controllers/notifications.controllers.js";
import { verifyInternalOrJWT, verifyJWT } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(30), notificationsController.getAllNotification)
    .post(verifyInternalOrJWT, deleteCache('/notifications'), notificationsController.createNotification);

// Authenticated endpoints — specific paths before /:id to avoid ambiguity
router.get('/me/inbox', verifyJWT, notificationsController.getMyNotifications);
router.patch('/me/read-all', verifyJWT, deleteCache('/notifications'), notificationsController.markAllAsRead);
router.delete('/me/read-all', verifyJWT, deleteCache('/notifications'), notificationsController.deleteReadNotifications);
router.patch('/:id/read', verifyJWT, deleteCache('/notifications'), notificationsController.markAsRead);
router.delete('/:id', verifyJWT, deleteCache('/notifications'), notificationsController.deleteNotification);
router.get('/:id', notificationsController.getNotification);

export default router;
