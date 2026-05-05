import { missingFieldError, validationError } from "./error.utils.js";
import { GoodsServices } from "../models/db.config.js";

export const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

export const needRequiredFields = ["estado", "items"];

export const buildNeedItems = (items, id_pedido) =>
  items.map((item) => ({
    id_pedido,
    tipo_bem_servico: item.tipo_bem_servico,
    publico: item.publico,
  }));

export const validateNeedItems = async (items) => {
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

  return null;
};

export const validateNeedCreatePayload = async (body) => {
  const missingFields = getMissingFields(body, ["nif_nipc", ...needRequiredFields]);
  if (missingFields.length) return missingFieldError(missingFields);

  return await validateNeedItems(body.items);
};

export const validateInstitutionNeedCreatePayload = async (body) => {
  const missingFields = getMissingFields(body, needRequiredFields);
  if (missingFields.length) return missingFieldError(missingFields);

  return await validateNeedItems(body.items);
};

export const validateNeedUpdatePayload = async (body) => {
  if (body.items !== undefined) {
    return await validateNeedItems(body.items);
  }
  return null;
};
