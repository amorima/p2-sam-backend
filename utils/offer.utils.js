import { GoodsServices } from "../models/db.config.js";
import { validationError } from "./error.utils.js";

export const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

export const offerRequiredFields = [
  "tipo_bem_servico",
  "descricao",
  "valor_total",
  "desconto",
];

export const ensureGoodsService = async (
  { tipo_bem_servico, tipo_bem },
  transaction
) => {
  if (!tipo_bem_servico) {
    throw validationError([
      { tipo_bem_servico: "tipo_bem_servico is required" },
    ]);
  }

  const goodsService = await GoodsServices.findByPk(tipo_bem_servico, {
    transaction,
  });

  if (goodsService) {
    if (tipo_bem !== undefined && goodsService.tipo_bem !== tipo_bem) {
      throw validationError([
        {
          tipo_bem: `Goods service '${tipo_bem_servico}' already exists as '${goodsService.tipo_bem}'`,
        },
      ]);
    }
    return goodsService;
  }

  if (!tipo_bem) {
    throw validationError([
      {
        tipo_bem: `tipo_bem is required for new goods service '${tipo_bem_servico}'`,
      },
    ]);
  }

  return GoodsServices.create(
    { tipo_bem_servico, tipo_bem },
    { transaction }
  );
};
