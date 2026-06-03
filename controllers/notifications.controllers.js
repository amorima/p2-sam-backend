import { Notifications } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";

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
    const notification = await Notifications.findById(id);
    if (!notification) return next(notFoundError("Notification", id));
    res.json(notification);
  } catch (e) {
    next(genericError("Error fetching notification"));
  }
};

export const getAllNotification = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const [total, items] = await Promise.all([
      Notifications.countDocuments({}),
      Notifications.find({}).sort({ data_envio: -1 }).skip(offset).limit(limit).lean()
    ]);
    res.json({ items, total, limit, offset, links: buildPageLinks('/api/notifications', limit, offset, total) });
  } catch (e) {
    next(genericError("Error fetching notifications"));
  }
};

// Returns notifications for the authenticated user (or all for admin)
export const getMyNotifications = async (req, res, next) => {
  const { role, nif_nipc } = req.user;
  try {
    const query = role === 'admin'
      ? { destinatario: 'admin' }
      : { destinatario: nif_nipc };
    const notifications = await Notifications.find(query)
      .sort({ data_envio: -1 })
      .limit(100)
      .lean();
    res.json(notifications);
  } catch (e) {
    next(genericError("Error fetching notifications"));
  }
};

export const markAsRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    const notification = await Notifications.findByIdAndUpdate(
      id,
      { lida: true },
      { new: true }
    );
    if (!notification) return next(notFoundError("Notification", id));
    res.json(notification);
  } catch (e) {
    next(genericError("Error marking notification as read"));
  }
};

export const markAllAsRead = async (req, res, next) => {
  const { role, nif_nipc } = req.user;
  try {
    const query = role === 'admin'
      ? { destinatario: 'admin', lida: false }
      : { destinatario: nif_nipc, lida: false };
    await Notifications.updateMany(query, { lida: true });
    res.json({ ok: true });
  } catch (e) {
    next(genericError("Error marking all notifications as read"));
  }
};

export const deleteNotification = async (req, res, next) => {
  const { id } = req.params;
  const { role, nif_nipc } = req.user;
  try {
    const notification = await Notifications.findById(id);
    if (!notification) return next(notFoundError("Notification", id));
    // Only allow deleting own notifications (or admin deletes any admin notification)
    const isOwner = role === 'admin'
      ? notification.destinatario === 'admin'
      : notification.destinatario === nif_nipc;
    if (!isOwner) return next(notFoundError("Notification", id));
    await notification.deleteOne();
    res.status(204).send();
  } catch (e) {
    next(genericError("Error deleting notification"));
  }
};

export const deleteReadNotifications = async (req, res, next) => {
  const { role, nif_nipc } = req.user;
  try {
    const query = role === 'admin'
      ? { destinatario: 'admin', lida: true }
      : { destinatario: nif_nipc, lida: true };
    const result = await Notifications.deleteMany(query);
    res.json({ deleted: result.deletedCount });
  } catch (e) {
    next(genericError("Error deleting read notifications"));
  }
};
