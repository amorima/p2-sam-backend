import { missingFieldError, validationError, genericError } from "../utils/error.utils.js";
import { getMissingFields } from "../utils/requestValidation.utils.js";

const donationRequiredFields = [
  "mecena_nif_nipc",
  "data",
  "valor_transacao",
  "tipo_donativo",
  "anonimo",
  "url_comprovativo",
  "estado",
];

export const validateDonationCreate = (req, res, next) => {
  const missingFields = getMissingFields(req.body, donationRequiredFields);
  if (missingFields.length) return next(missingFieldError(missingFields));
  next();
};

export const validatePatronDonationCreate = (req, res, next) => {
  const missingFields = getMissingFields(req.body, donationRequiredFields.filter((field) => field !== "mecena_nif_nipc"));
  if (missingFields.length) return next(missingFieldError(missingFields));

  const { nif_nipc } = req.params;
  if (req.body.mecena_nif_nipc && req.body.mecena_nif_nipc !== nif_nipc) {
    return next(validationError([{ mecena_nif_nipc: "Route patron and request patron must match" }]));
  }

  next();
};

export const validateDonationUpdate = (req, res, next) => {
  next();
};
