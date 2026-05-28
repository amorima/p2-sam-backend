import { Citizens, Leads } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, sequelizeValidationError, validationError } from "../utils/error.utils.js";

export const getAllCitizens = async (req, res, next) => {
  try {
    const citizens = await Citizens.findAll();
    res.json({ data: citizens });
  } catch (e) {
    next(genericError("Error fetching citizens"));
  }
};

export const getCitizen = async (req, res, next) => {
  const { contacto } = req.params;

  try {
    const citizen = await Citizens.findOne({ where: { contacto } });
    if (!citizen) return next(notFoundError("Citizen", contacto));
    res.json(citizen);
  } catch (e) {
    next(genericError("Error fetching citizen"));
  }
};

export const updateCitizenBlocked = async (req, res, next) => {
  const { contacto } = req.params;
  const { blocked, reason } = req.body;

  if (blocked === undefined || blocked === null) {
    return next(missingFieldError(["blocked"]));
  }

  if (typeof blocked !== "boolean" && blocked !== 0 && blocked !== 1) {
    return next(validationError([{ blocked: "blocked must be true, false, 1 or 0" }]));
  }

  if (blocked && (!reason || reason.length === 0)) {
    return next(validationError([{ reason: "Reason must be filled for a valid suspension" }]))
  }

  try {
    const citizen = await Citizens.findOne({ where: { contacto } });
    if (!citizen) return next(notFoundError("Citizen", contacto));

    citizen.blocked = Number(Boolean(blocked));
    citizen.reason = reason;
    await citizen.save();
    res.json(citizen);
  } catch (e) {
    next(genericError("Error updating citizen blocked"));
  }
};

export const deleteCitizen = async (req, res, next) => {
  const { contacto } = req.params;

  try {
    const citizen = await Citizens.findOne({ where: { contacto } });
    if (!citizen) return next(notFoundError("Citizen", contacto));

    const transaction = await Citizens.sequelize.transaction();

    try {
      await Leads.update(
        { contacto_cidadao: null },
        { where: { contacto_cidadao: contacto }, transaction }
      );

      await citizen.destroy({ transaction });
      await transaction.commit();
      res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    next(genericError("Error deleting citizen"));
  }
};
