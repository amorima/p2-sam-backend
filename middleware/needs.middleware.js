import { getMissingFields } from "../utils/requestValidation.utils.js";
import { genericError, missingFieldError, validationError } from "../utils/error.utils.js";
import { GoodsServices } from "../models/db.config.js";

const needRequiredFields = ["estado", "items"];

const validateNeedItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return validationError([{ items: "items must be a non-empty array" }]);
  }

  const missingItemFields = [];
  const tipoBemServicoSet = new Set();

  items.forEach((item, index) => {
    if (item.tipo_bem_servico === undefined || item.tipo_bem_servico === null) {
      missingItemFields.push(`items[${index}].tipo_bem_servico`);
    }
    if (item.publico === undefined || item.publico === null) {
      missingItemFields.push(`items[${index}].publico`);
    }
    if (item.tipo_bem_servico) {
      tipoBemServicoSet.add(item.tipo_bem_servico);
    }
  });

  if (missingItemFields.length) {
    return missingFieldError(missingItemFields);
  }

  const tipos = Array.from(tipoBemServicoSet);
  const goodsServices = await GoodsServices.findAll({
    where: { tipo_bem_servico: tipos },
  });

  const existingTipos = new Set(goodsServices.map((service) => service.tipo_bem_servico));
  const invalidTipos = tipos.filter((tipo) => !existingTipos.has(tipo));

  if (invalidTipos.length) {
    return validationError([
      {
        tipo_bem_servico: `Goods services not found: ${invalidTipos.join(", ")}`,
      },
    ]);
  }

  return { valid: true };
};

export const validateNeedCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, ["nif_nipc", ...needRequiredFields]);
  if (missingFields.length) return next(missingFieldError(missingFields));

  try {
    const validation = await validateNeedItems(req.body.items);
    if (validation.status === 400 || validation.errors) return next(validation);
    next();
  } catch (e) {
    if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error validating need create request"));
    }
  }
};

export const validateInstitutionNeedCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, needRequiredFields);
  if (missingFields.length) return next(missingFieldError(missingFields));

  try {
    const validation = await validateNeedItems(req.body.items);
    if (validation.status === 400 || validation.errors) return next(validation);
    next();
  } catch (e) {
    if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error validating institution need create request"));
    }
  }
};

export const validateNeedUpdate = async (req, res, next) => {
  if (req.body.items !== undefined) {
    try {
      const validation = await validateNeedItems(req.body.items);
      if (validation.status === 400 || validation.errors) return next(validation);
      next();
    } catch (e) {
      if (e.status === 400) {
        next(e);
      } else {
        next(genericError("Error validating need update request"));
      }
    }
  } else {
    next();
  }
};
