import { LockersTelemetry } from "../models/db.config.js";
import { genericError, notFoundError, validationError, missingFieldError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import { upsertTelemetryNotification, emitToAdmins, emitTelemetryUpdate } from "../utils/socket.js";

export const createLockerTelemetry = async (req, res, next) => {
  if (req.body.locker_id === undefined || req.body.locker_id === null) {
    return next(missingFieldError(["locker_id"]));
  }

  try {
    const telemetry = await LockersTelemetry.create({
      ...req.body,
      timestamp: req.body.timestamp ?? new Date(),
    });
    emitTelemetryUpdate(telemetry.toObject());

    if (req.body.aviso) {
      upsertTelemetryNotification({ aviso: req.body.aviso, locker_id: req.body.locker_id })
        .then(emitToAdmins);
    }

    res.status(201).json(telemetry);
  } catch (e) {
    if (e.name === "ValidationError" || e.name === "CastError") {
      return next(validationError([{ telemetry: "Invalid telemetry data" }]));
    }
    console.error("[telemetry] create error:", e);
    next(genericError("Error creating locker telemetry"));
  }
};

export const getLockerTelemetry = async (req, res, next) => {
  const { id } = req.params;

  try {
    const lockerId = Number(id);
    const query = Number.isNaN(lockerId)
      ? { _id: id }
      : { locker_id: lockerId };
    const telemetry = await LockersTelemetry.find(query)
      .sort({ timestamp: -1, _id: -1 })
      .limit(200)
      .lean();
    if (!telemetry || telemetry.length === 0) return next(notFoundError("LockerTelemetry", id));
    res.json(telemetry);
  } catch (e) {
    console.error("[telemetry] get by id error:", e);
    next(genericError("Error fetching locker telemetry"));
  }
};

export const getAllLockersTelemetry = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const [total, items] = await Promise.all([
      LockersTelemetry.countDocuments({}),
      LockersTelemetry.find({}).sort({ timestamp: -1, _id: -1 }).skip(offset).limit(limit).lean()
    ]);
    res.json({ items, total, limit, offset, links: buildPageLinks('/telemetry', limit, offset, total) });
  } catch (e) {
    console.error("[telemetry] list error:", e);
    next(genericError("Error fetching locker telemetry"));
  }
};