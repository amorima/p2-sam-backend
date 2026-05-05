import { Offers } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";

export const createOffer = async (req, res, next) => {
  const { negocio_nif_nipc, ...offerData } = req.body;

  try {
    const offer = await Offers.create({ negocio_nif_nipc, ...offerData });
    res.status(201).json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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
  const updateData = req.body;

  try {
    const offer = await Offers.findByPk(id_offer);
    if (!offer) return next(notFoundError("Offer", id_offer));

    await offer.update(updateData);
    res.json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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

  try {
    const offer = await Offers.create({ negocio_nif_nipc: nif_nipc, ...offerData });
    res.status(201).json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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
  const updateData = req.body;

  try {
    const offer = await Offers.findOne({
      where: { id_oferta: id_offer, negocio_nif_nipc: nif_nipc },
    });

    if (!offer) return next(notFoundError("Offer", id_offer));

    await offer.update(updateData);
    res.json({ offer });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
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