import { validateDonationPayload, validatePatronDonationPayload } from "../utils/donation.utils.js";

export const validateDonationCreate = (req, res, next) => {
  const validation = validateDonationPayload(req.body);
  if (validation) return next(validation);
  next();
};

export const validatePatronDonationCreate = (req, res, next) => {
  const validation = validatePatronDonationPayload(req.body, req.params.nif_nipc);
  if (validation) return next(validation);
  next();
};

export const validateDonationUpdate = (req, res, next) => {
  next();
};

