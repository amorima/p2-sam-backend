import { genericError, missingFieldError } from "../utils/error.utils.js";
import { offerRequiredFields, getMissingFields, validateGoodsService } from "../utils/offer.utils.js";

export const validateOfferCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, ["negocio_nif_nipc", ...offerRequiredFields]);
  if (missingFields.length) return next(missingFieldError(missingFields));

  try {
    await validateGoodsService(req.body.tipo_bem_servico);
    next();
  } catch (e) {
    if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error validating offer create request"));
    }
  }
};

export const validateBusinessOfferCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, offerRequiredFields);
  if (missingFields.length) return next(missingFieldError(missingFields));

  try {
    await validateGoodsService(req.body.tipo_bem_servico);
    next();
  } catch (e) {
    if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error validating business offer create request"));
    }
  }
};

export const validateOfferUpdate = async (req, res, next) => {
  if (req.body.tipo_bem_servico !== undefined) {
    try {
      await validateGoodsService(req.body.tipo_bem_servico);
      next();
    } catch (e) {
      if (e.status === 400) {
        next(e);
      } else {
        next(genericError("Error validating offer update request"));
      }
    }
  } else {
    next();
  }
};
