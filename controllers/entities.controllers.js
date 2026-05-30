import { Entities, Offers, Needs, NeedItem, Donations, Business, Institutions, Patrons, Contacts, LocationEntity } from "../models/db.config.js";
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

export const deleteEntity = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const entity = await Entities.findByPk(nif_nipc);
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    const transaction = await Entities.sequelize.transaction();
    try {
      // Remove all dependent rows before the entity itself. Each destroy is a
      // no-op when the entity is not of that type, so this works for patron,
      // business and institution accounts alike.
      await Offers.destroy({ where: { negocio_nif_nipc: nif_nipc }, transaction });

      const needs = await Needs.findAll({ where: { nif_nipc }, attributes: ["id_pedido"], transaction });
      const pedidoIds = needs.map((n) => n.id_pedido);
      if (pedidoIds.length) {
        await NeedItem.destroy({ where: { id_pedido: pedidoIds }, transaction });
      }
      await Needs.destroy({ where: { nif_nipc }, transaction });

      await Donations.destroy({ where: { mecena_nif_nipc: nif_nipc }, transaction });

      await Business.destroy({ where: { nif_nipc }, transaction });
      await Institutions.destroy({ where: { nif_nipc }, transaction });
      await Patrons.destroy({ where: { nif_nipc }, transaction });

      await Contacts.destroy({ where: { entidade_nif_nipc: nif_nipc }, transaction });
      await LocationEntity.destroy({ where: { entidade_nif_nipc: nif_nipc }, transaction });

      await entity.destroy({ transaction });
      await transaction.commit();
      res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    console.error("[entities] delete error:", e?.original?.sqlMessage || e?.message, e);
    next(genericError("Error deleting entity: " + (e?.original?.sqlMessage || e?.message || "unknown")));
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
