import { Needs, NeedItem } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";
import { buildNeedItems } from "../utils/need.utils.js";

export const createNeed = async (req, res, next) => {
  const { nif_nipc, estado, items } = req.body;

  try {
    const transaction = await Needs.sequelize.transaction();

    try {
      const need = await Needs.create({ nif_nipc, estado }, { transaction });
      const createdItems = await NeedItem.bulkCreate(buildNeedItems(items, need.id_pedido), {
        transaction,
      });
      await transaction.commit();
      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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
        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(buildNeedItems(items, id_need), {
          transaction,
        });
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

  try {
    const transaction = await Needs.sequelize.transaction();
    try {
      const need = await Needs.create({ nif_nipc, estado }, { transaction });
      const createdItems = await NeedItem.bulkCreate(buildNeedItems(items, need.id_pedido), {
        transaction,
      });
      await transaction.commit();
      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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
        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(buildNeedItems(items, id_need), {
          transaction,
        });
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