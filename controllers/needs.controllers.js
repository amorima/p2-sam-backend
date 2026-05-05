import { Needs, NeedItem, GoodsServices } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, sequelizeValidationError, validationError } from "../utils/error.utils.js";

const needRequiredFields = ["estado", "items"];

const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

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

const buildNeedItems = (items, id_pedido) =>
  items.map((item) => ({
    id_pedido,
    tipo_bem_servico: item.tipo_bem_servico,
    publico: item.publico,
  }));

export const createNeed = async (req, res, next) => {
  const { nif_nipc, estado, items } = req.body;
  const missingFields = getMissingFields(req.body, ["nif_nipc", ...needRequiredFields]);

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  try {
    const validation = await validateNeedItems(items);
    if (validation.status === 400 || validation.errors) {
      return next(validation);
    }

    const transaction = await Needs.sequelize.transaction();

    try {
      const need = await Needs.create({ nif_nipc, estado }, { transaction });
      const createdItems = await NeedItem.bulkCreate(
        buildNeedItems(items, need.id_pedido),
        { transaction }
      );
      await transaction.commit();
      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error creating need"));
    }
  }
};

export const getNeed = async (req, res, next) => {
  const { id_need } = req.params;

  try {
    const need = await Needs.findByPk(id_need, { include: [NeedItem] });
    if (!need) return next(notFoundError("Need", id_need));
    res.json({ need });
  } catch (e) {
    next(genericError("Error fetching need"));
  }
};

export const getAllNeeds = async (req, res, next) => {
  try {
    const needs = await Needs.findAll({ include: [NeedItem] });
    res.json({ needs });
  } catch (e) {
    next(genericError("Error fetching needs"));
  }
};

export const updateNeed = async (req, res, next) => {
  const { id_need } = req.params;
  const { estado, items, nif_nipc } = req.body;
  const updateData = {};

  if (estado !== undefined) updateData.estado = estado;
  if (nif_nipc !== undefined) updateData.nif_nipc = nif_nipc;

  try {
    const need = await Needs.findByPk(id_need);
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();

    try {
      if (Object.keys(updateData).length) {
        await need.update(updateData, { transaction });
      }

      let updatedItems = [];
      if (items !== undefined) {
        const validation = await validateNeedItems(items);
        if (validation.status === 400 || validation.errors) {
          await transaction.rollback();
          return next(validation);
        }

        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(
          buildNeedItems(items, id_need),
          { transaction }
        );
      }

      await transaction.commit();
      res.json({ need, items: updatedItems.length ? updatedItems : undefined });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating need"));
    }
  }
};

export const deleteNeed = async (req, res, next) => {
  const { id_need } = req.params;

  try {
    const need = await Needs.findByPk(id_need);
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
      await need.destroy({ transaction });
      await transaction.commit();
      res.status(204).json({});
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    next(genericError("Error deleting need"));
  }
};

export const createInstitutionNeed = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { estado, items } = req.body;
  const missingFields = getMissingFields(req.body, needRequiredFields);

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  try {
    const validation = await validateNeedItems(items);
    if (validation.status === 400 || validation.errors) {
      return next(validation);
    }

    const transaction = await Needs.sequelize.transaction();
    try {
      const need = await Needs.create({ nif_nipc, estado }, { transaction });
      const createdItems = await NeedItem.bulkCreate(
        buildNeedItems(items, need.id_pedido),
        { transaction }
      );
      await transaction.commit();
      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error creating institution need"));
    }
  }
};

export const getInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;

  try {
    const need = await Needs.findOne({
      where: { id_pedido: id_need, nif_nipc },
      include: [NeedItem],
    });
    if (!need) return next(notFoundError("Need", id_need));
    res.json({ need });
  } catch (e) {
    next(genericError("Error fetching institution need"));
  }
};

export const getAllInstitutionNeeds = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const needs = await Needs.findAll({ where: { nif_nipc }, include: [NeedItem] });
    res.json({ needs });
  } catch (e) {
    next(genericError("Error fetching institution needs"));
  }
};

export const updateInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;
  const { estado, items } = req.body;
  const updateData = {};
  if (estado !== undefined) updateData.estado = estado;

  try {
    const need = await Needs.findOne({ where: { id_pedido: id_need, nif_nipc } });
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      if (Object.keys(updateData).length) {
        await need.update(updateData, { transaction });
      }

      let updatedItems = [];
      if (items !== undefined) {
        const validation = await validateNeedItems(items);
        if (validation.status === 400 || validation.errors) {
          await transaction.rollback();
          return next(validation);
        }

        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(
          buildNeedItems(items, id_need),
          { transaction }
        );
      }

      await transaction.commit();
      res.json({ need, items: updatedItems.length ? updatedItems : undefined });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating institution need"));
    }
  }
};

export const deleteInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;

  try {
    const need = await Needs.findOne({ where: { id_pedido: id_need, nif_nipc } });
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
      await need.destroy({ transaction });
      await transaction.commit();
      res.status(204).json({});
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    next(genericError("Error deleting institution need"));
  }
};