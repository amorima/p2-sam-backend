import { FinancialLogs, InteractionLogs } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
export const getFinancialLog = async (req, res, next) => {
  const { id } = req.params;

  try {
    const financialLog = await FinancialLogs.findById(id).lean();
    if (!financialLog) return next(notFoundError("FinancialLog", id));
    res.json(financialLog);
  } catch (e) {
    next(genericError("Error fetching financial log"));
  }
};

export const getAllFinancialLogs = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const [items, total] = await Promise.all([
      FinancialLogs.find().skip(offset).limit(limit).lean(),
      FinancialLogs.countDocuments(),
    ]);
    res.json({ items, total, limit, offset, links: buildPageLinks('/logs/financials', limit, offset, total) });
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
  const { limit, offset } = parsePagination(req.query);
  try {
    const [items, total] = await Promise.all([
      InteractionLogs.find().skip(offset).limit(limit).lean(),
      InteractionLogs.countDocuments(),
    ]);
    res.json({ items, total, limit, offset, links: buildPageLinks('/logs/interactions', limit, offset, total) });
  } catch (e) {
    next(genericError("Error fetching interaction logs"));
  }
};