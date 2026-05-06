import { missingFieldError } from "../utils/error.utils.js";
import { offerRequiredFields, getMissingFields } from "../utils/offer.utils.js";

export const validateOfferCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, ["negocio_nif_nipc", ...offerRequiredFields]);
  if (missingFields.length) return next(missingFieldError(missingFields));
  next();
};

export const validateBusinessOfferCreate = async (req, res, next) => {
  const missingFields = getMissingFields(req.body, offerRequiredFields);
  if (missingFields.length) return next(missingFieldError(missingFields));
  next();
};
