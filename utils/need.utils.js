import { missingFieldError, validationError } from "./error.utils.js";
import { GoodsServices } from "../models/db.config.js";

export const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

export const needRequiredFields = ["items"];

export const buildNeedItems = (items, id_pedido) =>
  items.map((item) => {
    const needItem = {
      id_pedido,
      tipo_bem_servico: item.tipo_bem_servico,
    };
    // Only include completed if explicitly provided, otherwise use default
    if (item.completed !== undefined) {
      needItem.completed = item.completed;
    }
    return needItem;
  });

export const validateNeedItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return validationError([{ items: "items must be a non-empty array" }]);
  }

  const missingItemFields = [];

  items.forEach((item, index) => {
    if (item.tipo_bem_servico === undefined || item.tipo_bem_servico === null) {
      missingItemFields.push(`items[${index}].tipo_bem_servico`);
    }
  });

  if (missingItemFields.length) {
    return missingFieldError(missingItemFields);
  }

  return null;
};

export const ensureGoodsServicesForItems = async (items, transaction) => {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  const tipoBemServicoMap = new Map();
  const tipos = [];

  items.forEach((item, index) => {
    const tipoBemServico = item.tipo_bem_servico;
    const tipoBem = item.tipo_bem;

    if (tipoBemServico === undefined || tipoBemServico === null) {
      return;
    }

    if (!tipos.includes(tipoBemServico)) {
      tipos.push(tipoBemServico);
    }

    if (tipoBem !== undefined) {
      if (
        tipoBemServicoMap.has(tipoBemServico) &&
        tipoBemServicoMap.get(tipoBemServico) !== tipoBem
      ) {
        throw validationError([
          {
            tipo_bem: `Conflicting tipo_bem values provided for '${tipoBemServico}'`,
          },
        ]);
      }
      tipoBemServicoMap.set(tipoBemServico, tipoBem);
    } else if (!tipoBemServicoMap.has(tipoBemServico)) {
      tipoBemServicoMap.set(tipoBemServico, undefined);
    }
  });

  const existingGoodsServices = await GoodsServices.findAll({
    where: { tipo_bem_servico: tipos },
    transaction,
  });

  const existingTipoSet = new Set(
    existingGoodsServices.map((service) => service.tipo_bem_servico)
  );

  for (const service of existingGoodsServices) {
    const providedTipoBem = tipoBemServicoMap.get(service.tipo_bem_servico);
    if (
      providedTipoBem !== undefined &&
      providedTipoBem !== service.tipo_bem
    ) {
      throw validationError([
        {
          tipo_bem: `Goods service '${service.tipo_bem_servico}' already exists as '${service.tipo_bem}'`,
        },
      ]);
    }
  }

  const missingEntries = [];

  tipos.forEach((tipoBemServico) => {
    if (!existingTipoSet.has(tipoBemServico)) {
      const tipoBem = tipoBemServicoMap.get(tipoBemServico);
      if (!tipoBem) {
        throw validationError([
          {
            tipo_bem: `tipo_bem is required for new goods service '${tipoBemServico}'`,
          },
        ]);
      }
      missingEntries.push({ tipo_bem_servico: tipoBemServico, tipo_bem: tipoBem });
    }
  });

  if (missingEntries.length) {
    await GoodsServices.bulkCreate(missingEntries, {
      transaction,
      ignoreDuplicates: true,
    });
  }
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
