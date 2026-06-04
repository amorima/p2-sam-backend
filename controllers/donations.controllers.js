import { Op, fn, col, cast, where as sequelizeWhere } from "sequelize";
import { Donations, FinancialLogs, Patrons, Entities } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError, forbiddenError, unauthorizedError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import { buildFinancialLogData } from "../utils/donation.utils.js";
import { persistNotification, emitToAdmins, emitToUser } from "../utils/socket.js";

// Join donations to their patron's entity so the donor name is searchable.
// Always a LEFT JOIN (required:false) so donations without a patron row still list.
const patronEntityInclude = [
  {
    model: Patrons,
    required: false,
    attributes: ["nif_nipc"],
    include: [{ model: Entities, required: false, attributes: ["nif_nipc", "nome_entidade"] }],
  },
];

// Build a case-insensitive WHERE across donor name, NIF and transaction value.
// Returns undefined when there is no search term.
const buildDonationSearch = (q) => {
  const term = String(q ?? "").trim();
  if (!term) return undefined;
  const like = `%${term}%`;
  return {
    [Op.or]: [
      { mecena_nif_nipc: { [Op.like]: like } },
      { "$patron.Entity.nome_entidade$": { [Op.like]: like } },
      sequelizeWhere(cast(col("donation.valor_transacao"), "CHAR"), { [Op.like]: like }),
    ],
  };
};

export const createDonation = async (req, res, next) => {
  const { financial_log, anonimo, estado, ...donationData } = req.body;

  try {
    if (anonimo !== undefined) donationData.anonimo = anonimo;
    if (estado !== undefined) donationData.estado = estado;

    const donation = await Donations.create(donationData);

    if (financial_log) {
      try {
        await FinancialLogs.create(buildFinancialLogData(financial_log, donation));
      } catch (error) {
        await donation.destroy();
        throw error;
      }
    }

    persistNotification({
      tipo: 'doacao_criada',
      titulo: 'Nova Doação Registada',
      corpo: `Uma nova doação foi criada`,
      destinatario: 'admin',
      payload: { id_doacao: donation.id_doacao }
    }).then(emitToAdmins);

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
  const { limit, offset } = parsePagination(req.query);
  const search = buildDonationSearch(req.query.q);
  try {
    const { count: total, rows } = await Donations.findAndCountAll({
      where: search,
      include: patronEntityInclude,
      limit,
      offset,
      subQuery: false,
      distinct: true,
      order: [["id_doacao", "DESC"]],
    });
    // toJSON() → plain objects: the included Sequelize instances must never be
    // passed raw through setCache (node-cache deep-clones into the TCP socket).
    res.json({ items: rows.map((r) => r.toJSON()), total, limit, offset, links: buildPageLinks('/donations', limit, offset, total) });
  } catch (e) {
    console.error('[donations] getAll error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching donations"));
  }
};

// Aggregate totals for the dashboard cards, independent of pagination and
// honouring the same search term so the cards reflect the filtered set.
export const getDonationStats = async (req, res, next) => {
  const search = buildDonationSearch(req.query.q);
  try {
    const grouped = await Donations.findAll({
      where: search,
      // Join only to satisfy the name search; select NO joined columns so the
      // GROUP BY stays valid under only_full_group_by. Omit entirely when no search.
      include: search
        ? [{ model: Patrons, required: false, attributes: [], include: [{ model: Entities, required: false, attributes: [] }] }]
        : [],
      attributes: [
        "estado",
        [fn("COUNT", col("donation.id_doacao")), "n"],
        [fn("SUM", col("donation.valor_transacao")), "soma"],
      ],
      group: ["donation.estado"],
      subQuery: false,
      raw: true,
    });

    const stats = { total: 0, totalAceite: 0, aceites: 0, pendentes: 0, rejeitadas: 0 };
    for (const row of grouped) {
      const n = Number(row.n) || 0;
      stats.total += n;
      if (row.estado === "ACEITE") {
        stats.aceites = n;
        stats.totalAceite = Number(row.soma) || 0;
      } else if (row.estado === "PENDENTE") {
        stats.pendentes = n;
      } else if (row.estado === "REJEITADO") {
        stats.rejeitadas = n;
      }
    }
    res.json(stats);
  } catch (e) {
    console.error('[donations] stats error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching donation stats"));
  }
};

export const updateDonation = async (req, res, next) => {
  const { id_donation } = req.params;
  const { financial_log, ...updateData } = req.body;

  try {
    const donation = await Donations.findByPk(id_donation);
    if (!donation) return next(notFoundError("Donation", id_donation));

    await donation.update(updateData);
    if (updateData.estado && donation.mecena_nif_nipc) {
      persistNotification({
        tipo: 'doacao_atualizada',
        titulo: 'Doação Atualizada',
        corpo: `O estado da sua doação foi alterado para "${updateData.estado}"`,
        destinatario: donation.mecena_nif_nipc,
        payload: { id_doacao: donation.id_doacao, estado: updateData.estado }
      }).then(n => emitToUser(donation.mecena_nif_nipc, n));
    }
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
  const { financial_log, anonimo, estado, ...donationData } = req.body;

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  // Verify user is the patron owner or admin
  if (req.user.nif_nipc !== nif_nipc && req.user.role !== 'admin') {
    return next(forbiddenError('You do not have permission to create donations for this patron'));
  }

  try {
    // Only include anonimo and estado if explicitly provided
    donationData.mecena_nif_nipc = nif_nipc;
    if (anonimo !== undefined) donationData.anonimo = anonimo;
    if (estado !== undefined) donationData.estado = estado;

    const donation = await Donations.create(donationData);

    if (financial_log) {
      try {
        await FinancialLogs.create(buildFinancialLogData(financial_log, donation));
      } catch (error) {
        await donation.destroy();
        throw error;
      }
    }

    persistNotification({
      tipo: 'doacao_criada',
      titulo: 'Nova Doação de Mecenas',
      corpo: `Mecenas ${nif_nipc} criou uma nova doação`,
      destinatario: 'admin',
      payload: { id_doacao: donation.id_doacao, mecena_nif_nipc: nif_nipc }
    }).then(emitToAdmins);

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

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

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

  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  const { limit, offset } = parsePagination(req.query);
  try {
    const { count: total, rows } = await Donations.findAndCountAll({
      where: { mecena_nif_nipc: nif_nipc }, limit, offset, order: [["id_doacao", "DESC"]]
    });
    res.json({ items: rows, total, limit, offset, links: buildPageLinks(`/patrons/${nif_nipc}/donations`, limit, offset, total) });
  } catch (e) {
    next(genericError("Error fetching patron donations"));
  }
};

export const updatePatronDonation = async (req, res, next) => {
  const { id_donation, nif_nipc } = req.params;
  const { financial_log, ...updateData } = req.body;

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

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

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

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