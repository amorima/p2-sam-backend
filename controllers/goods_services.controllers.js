import { GoodsServices } from "../models/db.config.js";
import { genericError, missingFieldError, notFoundError, conflictError } from "../utils/error.utils.js";

export const createGoodsService = async (req, res, next) => {
  const { tipo_bem_servico, tipo_bem } = req.body;

  if (!tipo_bem_servico || !tipo_bem) {
    return next(missingFieldError(["tipo_bem_servico", "tipo_bem"]));
  }
  if (!["bem", "servico"].includes(tipo_bem)) {
    return next(missingFieldError(["tipo_bem must be 'bem' or 'servico'"]));
  }

  try {
    const existing = await GoodsServices.findByPk(tipo_bem_servico);
    if (existing) {
      return next(conflictError([{ tipo_bem_servico: "Bem/serviço já existe" }]));
    }
    const item = await GoodsServices.create({ tipo_bem_servico: tipo_bem_servico.trim(), tipo_bem });
    res.status(201).json({ tipo_bem_servico: item.tipo_bem_servico, tipo_bem: item.tipo_bem });
  } catch (e) {
    next(genericError("Error creating goods service"));
  }
};

export const deleteGoodsService = async (req, res, next) => {
  const { tipo_bem_servico } = req.params;

  try {
    const item = await GoodsServices.findByPk(tipo_bem_servico);
    if (!item) return next(notFoundError("GoodsService", tipo_bem_servico));
    await item.destroy();
    res.status(204).send();
  } catch (e) {
    next(genericError("Error deleting goods service"));
  }
};

export const getAllGoodsServices = async (req, res, next) => {
  try {
    const { tipo_bem } = req.query;
    const where = tipo_bem ? { tipo_bem } : undefined;
    const items = await GoodsServices.findAll({
      ...(where && { where }),
      order: [["tipo_bem", "ASC"], ["tipo_bem_servico", "ASC"]],
    });
    res.json({
      data: items.map((g) => ({
        tipo_bem_servico: g.tipo_bem_servico,
        tipo_bem: g.tipo_bem,
      })),
    });
  } catch (e) {
    console.error('[goods-services] getAll error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching goods and services"));
  }
};
