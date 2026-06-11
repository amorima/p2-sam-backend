import { GoodsServices, NeedItem, Offers } from "../models/db.config.js";
import { genericError, missingFieldError, notFoundError, conflictError, validationError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";

export const createGoodsService = async (req, res, next) => {
  const { tipo_bem_servico, tipo_bem } = req.body;

  if (!tipo_bem_servico || !tipo_bem) {
    return next(missingFieldError(["tipo_bem_servico", "tipo_bem"]));
  }
  if (typeof tipo_bem_servico !== "string" || !tipo_bem_servico.trim()) {
    return next(validationError([{ tipo_bem_servico: "tipo_bem_servico must be a non-empty string" }]));
  }
  if (!["bem", "servico"].includes(tipo_bem)) {
    return next(validationError([{ tipo_bem: "tipo_bem must be 'bem' or 'servico'" }]));
  }

  const cleanTipo = tipo_bem_servico.trim();

  try {
    const existing = await GoodsServices.findByPk(cleanTipo);
    if (existing) {
      return next(conflictError([{ tipo_bem_servico: "Bem/serviço já existe" }]));
    }
    const item = await GoodsServices.create({ tipo_bem_servico: cleanTipo, tipo_bem });
    res.status(201).json({ tipo_bem_servico: item.tipo_bem_servico, tipo_bem: item.tipo_bem });
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return next(conflictError([{ tipo_bem_servico: "Bem/serviço já existe" }]));
    }
    next(genericError("Error creating goods service"));
  }
};

export const deleteGoodsService = async (req, res, next) => {
  const { tipo_bem_servico } = req.params;

  try {
    const item = await GoodsServices.findByPk(tipo_bem_servico);
    if (!item) return next(notFoundError("GoodsService", tipo_bem_servico));

    const [needCount, offerCount] = await Promise.all([
      NeedItem.count({ where: { tipo_bem_servico } }),
      Offers.count({ where: { tipo_bem_servico } }),
    ]);

    if (needCount > 0 || offerCount > 0) {
      return next(conflictError([{
        tipo_bem_servico: `Não é possível eliminar: está em uso em ${needCount} pedido(s) e ${offerCount} oferta(s)`
      }]));
    }

    await item.destroy();
    res.status(204).send();
  } catch (e) {
    next(genericError("Error deleting goods service"));
  }
};

export const getAllGoodsServices = async (req, res, next) => {
  const { tipo_bem } = req.query;
  const { limit, offset } = parsePagination(req.query);
  const where = tipo_bem ? { tipo_bem } : undefined;
  try {
    const { count: total, rows } = await GoodsServices.findAndCountAll({
      ...(where && { where }),
      order: [["tipo_bem", "ASC"], ["tipo_bem_servico", "ASC"]],
      limit,
      offset
    });
    const items = rows.map((g) => ({ tipo_bem_servico: g.tipo_bem_servico, tipo_bem: g.tipo_bem }));
    res.json({ items, total, limit, offset, links: buildPageLinks('/goods-services', limit, offset, total) });
  } catch (e) {
    console.error('[goods-services] getAll error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching goods and services"));
  }
};
