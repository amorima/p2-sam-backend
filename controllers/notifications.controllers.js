import { Notifications } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";

export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notifications.create(req.body);
    res.status(201).json(notification);
  } catch (e) {
    next(genericError("Error creating notification"));
  }
};

export const getNotification = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notifications.findByPk(id);
    if (!notification) return next(notFoundError("Notification", id));
    res.json(notification);
  } catch (e) {
    next(genericError("Error fetching notification"));
  }
};

export const getAllNotification = async (req, res, next) => {
  try {
    const notifications = await Notifications.findAll();
    res.json(notifications);
  } catch (e) {
    next(genericError("Error fetching notifications"));
  }
};