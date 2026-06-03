import { Citizens, Leads } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, sequelizeValidationError, validationError, conflictError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";

export const getAllCitizens = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const { count: total, rows: items } = await Citizens.findAndCountAll({ limit, offset });
    res.json({ items, total, limit, offset, links: buildPageLinks('/api/citizens', limit, offset, total) });
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

export const createCitizen = async (req, res, next) => {
  const { nome, contacto } = req.body;
  let { rgpd } = req.body;

  const missingFields = [];
  if (!nome || String(nome).trim().length === 0) missingFields.push("nome");
  if (!contacto || String(contacto).trim().length === 0) missingFields.push("contacto");
  if (missingFields.length) return next(missingFieldError(missingFields));

  // RGPD consent defaults to accepted when created by an administrator.
  rgpd = rgpd === undefined || rgpd === null ? 1 : Number(Boolean(rgpd));

  const cleanNome = String(nome).trim();
  const cleanContacto = String(contacto).trim();

  try {
    const existing = await Citizens.findOne({ where: { contacto: cleanContacto } });
    if (existing) {
      return next(conflictError([{ contacto: "A citizen with this contacto already exists" }]));
    }

    const citizen = await Citizens.create({
      nome: cleanNome,
      contacto: cleanContacto,
      rgpd,
      blocked: 0,
    });

    res.status(201).json({
      nome: citizen.nome,
      contacto: citizen.contacto,
      rgpd: citizen.rgpd,
      blocked: Boolean(citizen.blocked),
      reason: citizen.reason ?? null,
    });
  } catch (e) {
    console.error("[citizens] create error:", e);
    if (e?.name === "SequelizeUniqueConstraintError") {
      return next(conflictError([{ contacto: "A citizen with this nome or contacto already exists" }]));
    }
    if (e?.name === "SequelizeValidationError") {
      return next(sequelizeValidationError(e.errors));
    }
    next(genericError("Error creating citizen"));
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

  const willBlock = Boolean(blocked);
  if (willBlock && (!reason || String(reason).trim().length === 0)) {
    return next(validationError([{ reason: "Reason must be filled for a valid suspension" }]));
  }

  const newReason = willBlock ? String(reason).trim() : null;

  try {
    const citizen = await Citizens.findOne({ where: { contacto } });
    if (!citizen) return next(notFoundError("Citizen", contacto));


    await Citizens.update(
      { blocked: Number(willBlock), reason: newReason },
      { where: { contacto } }
    );

    res.json({
      nome: citizen.nome,
      contacto,
      blocked: willBlock,
      reason: newReason,
    });
  } catch (e) {
    console.error("[citizens] block error:", e?.original?.sqlMessage || e?.message, e);
    if (e?.name === "SequelizeValidationError" || e?.name === "SequelizeUniqueConstraintError") {
      return next(sequelizeValidationError(e.errors));
    }
    // Surface the underlying cause on this admin-only endpoint to aid diagnosis.
    next(genericError("Error updating citizen blocked: " + (e?.original?.sqlMessage || e?.message || "unknown")));
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
    console.error("[citizens] delete error:", e);
    next(genericError("Error deleting citizen"));
  }
};
