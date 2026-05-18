import { LockersTelemetry } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";

export const createLockerTelemetry = async (req, res, next) => {
  try {
    const telemetry = await LockersTelemetry.create(req.body);
    res.status(201).json(telemetry);
  } catch (e) {
    next(genericError("Error creating locker telemetry"));
  }
};

export const getLockerTelemetry = async (req, res, next) => {
  const { id } = req.params;

  try {
    const telemetry = await LockersTelemetry.findByPk(id);
    if (!telemetry) return next(notFoundError("LockerTelemetry", id));
    res.json(telemetry);
  } catch (e) {
    next(genericError("Error fetching locker telemetry"));
  }
};

export const getAllLockersTelemetry = async (req, res, next) => {
  try {
    const telemetry = await LockersTelemetry.findAll();
    res.json(telemetry);
  } catch (e) {
    next(genericError("Error fetching locker telemetry"));
  }
};