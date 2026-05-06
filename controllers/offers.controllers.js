import { Offers } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";
import { ensureGoodsService } from "../utils/offer.utils.js";

export const createOffer = async (req, res, next) => {
  const { negocio_nif_nipc, tipo_bem, ...offerData } = req.body;
  const transaction = await Offers.sequelize.transaction();

  try {
    await ensureGoodsService(
      { tipo_bem_servico: req.body.tipo_bem_servico, tipo_bem },
      transaction
    );

    const offer = await Offers.create(
      { negocio_nif_nipc, ...offerData },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ offer });
  } catch (e) {
    await transaction.rollback();
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
  const { tipo_bem, ...updateData } = req.body;

  try {
    const offer = await Offers.findByPk(id_offer);
    if (!offer) return next(notFoundError("Offer", id_offer));

    const transaction = await Offers.sequelize.transaction();
    try {
      const tipoBemServico =
        updateData.tipo_bem_servico ?? offer.tipo_bem_servico;

      if (updateData.tipo_bem_servico !== undefined || tipo_bem !== undefined) {
        await ensureGoodsService(
          { tipo_bem_servico: tipoBemServico, tipo_bem },
          transaction
        );
      }

      await offer.update(updateData, { transaction });
      await transaction.commit();
      res.json({ offer });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
  const { tipo_bem, ...offerData } = req.body;
  const transaction = await Offers.sequelize.transaction();

  try {
    await ensureGoodsService(
      { tipo_bem_servico: req.body.tipo_bem_servico, tipo_bem },
      transaction
    );

    const offer = await Offers.create(
      { negocio_nif_nipc: nif_nipc, ...offerData },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ offer });
  } catch (e) {
    await transaction.rollback();
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
  const { tipo_bem, ...updateData } = req.body;

  try {
    const offer = await Offers.findOne({
      where: { id_oferta: id_offer, negocio_nif_nipc: nif_nipc },
    });

    if (!offer) return next(notFoundError("Offer", id_offer));

    const transaction = await Offers.sequelize.transaction();
    try {
      const tipoBemServico =
        updateData.tipo_bem_servico ?? offer.tipo_bem_servico;

      if (updateData.tipo_bem_servico !== undefined || tipo_bem !== undefined) {
        await ensureGoodsService(
          { tipo_bem_servico: tipoBemServico, tipo_bem },
          transaction
        );
      }

      await offer.update(updateData, { transaction });
      await transaction.commit();
      res.json({ offer });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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