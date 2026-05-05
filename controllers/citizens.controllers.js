import { Citizens, Leads } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, sequelizeValidationError, validationError } from "../utils/error.utils.js";

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

export const updateCitizenSuspense = async (req, res, next) => {
  const { contacto } = req.params;
  const { suspense } = req.body;

  if (suspense === undefined || suspense === null) {
    return next(missingFieldError(["suspense"]));
  }

  if (typeof suspense !== "boolean" && suspense !== 0 && suspense !== 1) {
    return next(validationError([{ suspense: "Suspense must be true, false, 1 or 0" }]));
  }

  try {
    const citizen = await Citizens.findOne({ where: { contacto } });
    if (!citizen) return next(notFoundError("Citizen", contacto));

    citizen.suspense = Number(Boolean(suspense));
    await citizen.save();
    res.json(citizen);
  } catch (e) {
    next(genericError("Error updating citizen suspense"));
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
