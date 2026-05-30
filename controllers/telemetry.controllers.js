import { LockersTelemetry } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";
import { persistNotification, emitToAdmins, emitTelemetryUpdate } from "../utils/socket.js";

export const createLockerTelemetry = async (req, res, next) => {
  try {
    const telemetry = await LockersTelemetry.create({
      ...req.body,
      timestamp: req.body.timestamp ?? new Date(),
    });
    emitTelemetryUpdate(telemetry.toObject());

    if (req.body.aviso) {
      persistNotification({
        tipo: 'telemetria_alerta',
        titulo: 'Alerta de Telemetria',
        corpo: `Painel reportou: ${req.body.aviso}`,
        destinatario: 'admin',
        payload: { locker_id: req.body.locker_id, aviso: req.body.aviso }
      }).then(emitToAdmins);
    }

    res.status(201).json(telemetry);
  } catch (e) {
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
  try {
    const telemetry = await LockersTelemetry.find({})
      .sort({ timestamp: -1, _id: -1 })
      .limit(1000)
      .lean();
    res.json(telemetry);
  } catch (e) {
    console.error("[telemetry] list error:", e);
    next(genericError("Error fetching locker telemetry"));
  }
};