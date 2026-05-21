import { FinancialLogs, InteractionLogs } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";
//
export const getFinancialLog = async (req, res, next) => {
  const { id } = req.params;

  try {
    const financialLog = await FinancialLogs.findByPk(id);
    if (!financialLog) return next(notFoundError("FinancialLog", id));
    res.json(financialLog);
  } catch (e) {
    next(genericError("Error fetching financial log"));
  }
};

export const getAllFinancialLogs = async (req, res, next) => {
  try {
    const financialLogs = await FinancialLogs.findAll();
    res.json(financialLogs);
  } catch (e) {
    next(genericError("Error fetching financial logs"));
  }
};

export const createInteractionLog = async (req, res, next) => {
  try {
    const interactionLog = await InteractionLogs.create(req.body);
    res.status(201).json(interactionLog);
  } catch (e) {
    next(genericError("Error creating interaction log"));
  }
};

export const getAllInteractionLogs = async (req, res, next) => {
  try {
    const interactionLogs = await InteractionLogs.findAll();
    res.json(interactionLogs);
  } catch (e) {
    next(genericError("Error fetching interaction logs"));
  }
};