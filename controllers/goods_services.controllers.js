import { GoodsServices } from "../models/db.config.js";
import { genericError } from "../utils/error.utils.js";

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
    next(genericError("Error fetching goods and services"));
  }
};
