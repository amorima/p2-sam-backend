import { Offers, GoodsServices } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, sequelizeValidationError, validationError } from "../utils/error.utils.js";

const offerRequiredFields = [
  "tipo_bem_servico",
  "descricao",
  "valor_total",
  "desconto",
];

const getMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => body[field] === undefined || body[field] === null);

const validateGoodsService = async (tipo_bem_servico) => {
  const goodsService = await GoodsServices.findByPk(tipo_bem_servico);
  if (!goodsService) {
    throw validationError([
      {
        tipo_bem_servico: `Goods service '${tipo_bem_servico}' does not exist`,
      },
    ]);
  }
  return goodsService;
};

export const createOffer = async (req, res, next) => {
  const { negocio_nif_nipc, ...offerData } = req.body;
  const missingFields = getMissingFields({ negocio_nif_nipc, ...offerData }, [
    "negocio_nif_nipc",
    ...offerRequiredFields,
  ]);

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  try {
    await validateGoodsService(offerData.tipo_bem_servico);
    const offer = await Offers.create({ negocio_nif_nipc, ...offerData });
    res.status(201).json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error creating offer"));
    }
  }
};

export const getOffer = async (req, res, next) => {
  const { id_offer } = req.params;

  try {
    const offer = await Offers.findByPk(id_offer);
    if (!offer) return next(notFoundError("Offer", id_offer));
    res.json({ offer });
  } catch (e) {
    next(genericError("Error fetching offer"));
  }
};

export const getAllOffers = async (req, res, next) => {
  try {
    const offers = await Offers.findAll();
    res.json({ offers });
  } catch (e) {
    next(genericError("Error fetching offers"));
  }
};

export const updateOffer = async (req, res, next) => {
  const { id_offer } = req.params;
  const { tipo_bem_servico, ...updateData } = req.body;

  try {
    const offer = await Offers.findByPk(id_offer);
    if (!offer) return next(notFoundError("Offer", id_offer));

    if (tipo_bem_servico) {
      await validateGoodsService(tipo_bem_servico);
      updateData.tipo_bem_servico = tipo_bem_servico;
    }

    await offer.update(updateData);
    res.json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error updating offer"));
    }
  }
};

export const deleteOffer = async (req, res, next) => {
  const { id_offer } = req.params;

  try {
    const offer = await Offers.findByPk(id_offer);
    if (!offer) return next(notFoundError("Offer", id_offer));

    await offer.destroy();
    res.status(204).json({});
  } catch (e) {
    next(genericError("Error deleting offer"));
  }
};

export const createBusinessOffer = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const offerData = req.body;
  const missingFields = getMissingFields(offerData, offerRequiredFields);

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  try {
    await validateGoodsService(offerData.tipo_bem_servico);
    const offer = await Offers.create({ negocio_nif_nipc: nif_nipc, ...offerData });
    res.status(201).json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error creating business offer"));
    }
  }
};

export const getBusinessOffer = async (req, res, next) => {
  const { id_offer, nif_nipc } = req.params;

  try {
    const offer = await Offers.findOne({
      where: { id_oferta: id_offer, negocio_nif_nipc: nif_nipc },
    });

    if (!offer) return next(notFoundError("Offer", id_offer));
    res.json({ offer });
  } catch (e) {
    next(genericError("Error fetching business offer"));
  }
};

export const getAllBusinessOffers = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const offers = await Offers.findAll({ where: { negocio_nif_nipc: nif_nipc } });
    res.json({ offers });
  } catch (e) {
    next(genericError("Error fetching business offers"));
  }
};

export const updateBusinessOffer = async (req, res, next) => {
  const { id_offer, nif_nipc } = req.params;
  const { tipo_bem_servico, ...updateData } = req.body;

  try {
    const offer = await Offers.findOne({
      where: { id_oferta: id_offer, negocio_nif_nipc: nif_nipc },
    });

    if (!offer) return next(notFoundError("Offer", id_offer));

    if (tipo_bem_servico) {
      await validateGoodsService(tipo_bem_servico);
      updateData.tipo_bem_servico = tipo_bem_servico;
    }

    await offer.update(updateData);
    res.json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 400) {
      next(e);
    } else {
      next(genericError("Error updating business offer"));
    }
  }
};

export const deleteBusinessOffer = async (req, res, next) => {
  const { id_offer, nif_nipc } = req.params;

  try {
    const offer = await Offers.findOne({
      where: { id_oferta: id_offer, negocio_nif_nipc: nif_nipc },
    });

    if (!offer) return next(notFoundError("Offer", id_offer));

    await offer.destroy();
    res.status(204).json({});
  } catch (e) {
    next(genericError("Error deleting business offer"));
  }
};