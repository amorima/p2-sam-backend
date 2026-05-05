import { validateNeedCreatePayload, validateInstitutionNeedCreatePayload, validateNeedUpdatePayload } from "../utils/need.utils.js";

export const validateNeedCreate = async (req, res, next) => {
  try {
    const validation = await validateNeedCreatePayload(req.body);
    if (validation) return next(validation);
    next();
  } catch (e) {
    next(e);
  }
};

export const validateInstitutionNeedCreate = async (req, res, next) => {
  try {
    const validation = await validateInstitutionNeedCreatePayload(req.body);
    if (validation) return next(validation);
    next();
  } catch (e) {
    next(e);
  }
};

export const validateNeedUpdate = async (req, res, next) => {
  if (req.body.items !== undefined) {
    try {
      const validation = await validateNeedUpdatePayload(req.body);
      if (validation) return next(validation);
      next();
    } catch (e) {
      next(e);
    }
  } else {
    next();
  }
};
