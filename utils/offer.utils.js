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

export const validateGoodsService = async (tipo_bem_servico) => {
  const goodsService = await GoodsServices.findByPk(tipo_bem_servico);
  if (!goodsService) {
    throw validationError([
      {
        tipo_bem_servico: `Goods service '${tipo_bem_servico}' does not exist`,
      },
    ]);
  }
};
