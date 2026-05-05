import { Donations, FinancialLogs } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";
import { buildFinancialLogData } from "../utils/donation.utils.js";

export const createDonation = async (req, res, next) => {
  const { financial_log, ...donationData } = req.body;

  try {
    const donation = await Donations.create(donationData);

    if (financial_log) {
      try {
        await FinancialLogs.create(buildFinancialLogData(financial_log, donation));
      } catch (error) {
        await donation.destroy();
        throw error;
      }
    }

    res.status(201).json({ donation });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error creating donation"));
    }
  }
};

export const getDonation = async (req, res, next) => {
  const { id_donation } = req.params;

  try {
    const donation = await Donations.findByPk(id_donation);
    if (!donation) return next(notFoundError("Donation", id_donation));

    res.json({ donation });
  } catch (e) {
    next(genericError("Error fetching donation"));
  }
};

export const getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donations.findAll();
    res.json({ donations });
  } catch (e) {
    next(genericError("Error fetching donations"));
  }
};

export const updateDonation = async (req, res, next) => {
  const { id_donation } = req.params;
  const { financial_log, ...updateData } = req.body;

  try {
    const donation = await Donations.findByPk(id_donation);
    if (!donation) return next(notFoundError("Donation", id_donation));

    await donation.update(updateData);
    res.json({ donation });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating donation"));
    }
  }
};

export const deleteDonation = async (req, res, next) => {
  const { id_donation } = req.params;

  try {
    const donation = await Donations.findByPk(id_donation);
    if (!donation) return next(notFoundError("Donation", id_donation));

    await donation.destroy();
    res.status(204).json({});
  } catch (e) {
    next(genericError("Error deleting donation"));
  }
};

export const createPatronDonation = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { financial_log, ...donationData } = req.body;

  try {
    const donation = await Donations.create({ ...donationData, mecena_nif_nipc: nif_nipc });

    if (financial_log) {
      try {
        await FinancialLogs.create(buildFinancialLogData(financial_log, donation));
      } catch (error) {
        await donation.destroy();
        throw error;
      }
    }

    res.status(201).json({ donation });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error creating patron donation"));
    }
  }
};

export const getPatronDonation = async (req, res, next) => {
  const { id_donation, nif_nipc } = req.params;

  try {
    const donation = await Donations.findOne({
      where: { id_doacao: id_donation, mecena_nif_nipc: nif_nipc },
    });

    if (!donation) return next(notFoundError("Donation", id_donation));
    res.json({ donation });
  } catch (e) {
    next(genericError("Error fetching patron donation"));
  }
};

export const getAllPatronDonation = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const donations = await Donations.findAll({ where: { mecena_nif_nipc: nif_nipc } });
    res.json({ donations });
  } catch (e) {
    next(genericError("Error fetching patron donations"));
  }
};

export const updatePatronDonation = async (req, res, next) => {
  const { id_donation, nif_nipc } = req.params;
  const { financial_log, ...updateData } = req.body;

  try {
    const donation = await Donations.findOne({
      where: { id_doacao: id_donation, mecena_nif_nipc: nif_nipc },
    });

    if (!donation) return next(notFoundError("Donation", id_donation));

    await donation.update(updateData);
    res.json({ donation });
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating patron donation"));
    }
  }
};

export const deletePatronDonation = async (req, res, next) => {
  const { id_donation, nif_nipc } = req.params;

  try {
    const donation = await Donations.findOne({
      where: { id_doacao: id_donation, mecena_nif_nipc: nif_nipc },
    });

    if (!donation) return next(notFoundError("Donation", id_donation));

    await donation.destroy();
    res.status(204).json({});
  } catch (e) {
    next(genericError("Error deleting patron donation"));
  }
};