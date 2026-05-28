import { Entities } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, validationError, forbiddenError } from "../utils/error.utils.js";

export const updateEntityProfile = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { nome_entidade, email_login } = req.body;

  if (!nome_entidade && !email_login) {
    return next(missingFieldError(["nome_entidade or email_login"]));
  }

  try {
    const entity = await Entities.findByPk(nif_nipc);
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    if (nome_entidade) entity.nome_entidade = String(nome_entidade).trim();
    if (email_login) entity.email_login = String(email_login).trim();
    await entity.save();

    res.json({
      nif_nipc: entity.nif_nipc,
      nome_entidade: entity.nome_entidade,
      email_login: entity.email_login,
    });
  } catch (e) {
    next(genericError("Error updating entity profile"));
  }
};

export const updateEntityBlocked = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { blocked, reason } = req.body;

  if (blocked === undefined || blocked === null) {
    return next(missingFieldError(["blocked"]));
  }

  if (typeof blocked !== "boolean" && blocked !== 0 && blocked !== 1) {
    return next(validationError([{ blocked: "blocked must be true, false, 1 or 0" }]));
  }

  const willBlock = Boolean(blocked);
  if (willBlock && (!reason || String(reason).trim().length === 0)) {
    return next(validationError([{ reason: "Reason must be filled for a valid suspension" }]));
  }

  try {
    const entity = await Entities.findByPk(nif_nipc);
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    entity.blocked = Number(willBlock);
    entity.reason = willBlock ? String(reason).trim() : null;
    await entity.save();
    res.json({
      nif_nipc: entity.nif_nipc,
      blocked: Boolean(entity.blocked),
      reason: entity.reason ?? null,
    });
  } catch (e) {
    console.error("[entities] block error:", e);
    next(genericError("Error updating entity blocked"));
  }
};
