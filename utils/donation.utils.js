import { missingFieldError, validationError } from "./error.utils.js";

export const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

export const buildFinancialLogData = (financial_log, donation) => ({
  ...financial_log,
  id_doacao: donation.id_doacao,
  mecena_nif_nipc: donation.mecena_nif_nipc,
});

export const donationRequiredFields = [
  "mecena_nif_nipc",
  "data",
  "valor_transacao",
  "tipo_donativo",
  "url_comprovativo",
];

export const validateDonationPayload = (body) => {
  const missingFields = getMissingFields(body, donationRequiredFields);
  if (missingFields.length) return missingFieldError(missingFields);
  return null;
};

export const validatePatronDonationPayload = (body, nif_nipc) => {
  const missingFields = getMissingFields(body, donationRequiredFields.filter((field) => field !== "mecena_nif_nipc"));
  if (missingFields.length) {
    return missingFieldError(missingFields);
  }

  if (body.mecena_nif_nipc && body.mecena_nif_nipc !== nif_nipc) {
    return validationError([{ mecena_nif_nipc: "Route patron and request patron must match" }]);
  }

  return null;
};
