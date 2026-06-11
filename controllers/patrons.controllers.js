import { Op } from "sequelize";
import { Entities, Locations, Contacts, Donations } from "../models/db.config.js";
import { genericError, notFoundError, conflictError, missingFieldError, sequelizeValidationError, validationError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import { formatResponse, syncEntityRelations } from "../utils/entity.utils.js";
import { hashPassword } from "../utils/auth.utils.js";
import { sendRegistrationEmail } from "../utils/email.utils.js";

const patronInclude = [
  {
    model: Locations,
    as: "locations",
    through: { attributes: [] },
    attributes: ["codigo_postal", "concelho", "distrito", "freguesia", "pais", "rua", "n_porta"],
  },
  {
    model: Contacts,
    attributes: ["contacto", "nome_contacto", "descricao"],
  },
];

const buildPatronSearch = (q) => {
  const term = String(q ?? "").trim();
  const baseWhere = { role: "patron" };
  if (!term) return { where: baseWhere, include: patronInclude };
  const like = `%${term}%`;
  return {
    where: {
      ...baseWhere,
      [Op.or]: [
        { nif_nipc: { [Op.like]: like } },
        { nome_entidade: { [Op.like]: like } },
        { email_login: { [Op.like]: like } },
      ],
    },
    include: patronInclude,
  };
};

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export const createPatron = async (req, res, next) => {
  const { location, entity, contacts } = req.body;

  const missingFields = [];
  if (!location) missingFields.push("location");
  if (!entity) missingFields.push("entity");
  // Without nif_nipc the entity lookup below throws a Sequelize "invalid
  // undefined value" error that would surface as a 500.
  if (entity && !entity.nif_nipc) missingFields.push("entity.nif_nipc");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  if (!isPlainObject(location) || !isPlainObject(entity)) {
    return next(validationError([{ body: "location and entity must be objects" }]));
  }
  if (contacts !== undefined && !Array.isArray(contacts)) {
    return next(validationError([{ contacts: "contacts must be an array" }]));
  }

  const transaction = await Entities.sequelize.transaction();

  try {
    const entityWithRole = { ...entity, role: "patron" };

    if (entityWithRole.password) {
      entityWithRole.password = await hashPassword(entityWithRole.password);
    }

    const existing = await Entities.findOne({
      where: { nif_nipc: entity.nif_nipc },
      transaction,
    });
    if (existing) {
      throw conflictError([{ patron: "Patron already exists for this entity" }]);
    }

    const { entityInstance, locationInstances } = await syncEntityRelations({
      entity: entityWithRole,
      locations: [location],
      contacts,
      transaction,
    });

    await transaction.commit();

    sendRegistrationEmail({
      email: entity.email_login,
      nome_entidade: entityInstance.nome_entidade,
      nif_nipc: entityInstance.nif_nipc,
      role: "patron",
    });

    const response = formatResponse({
      resource: { nif_nipc: entityInstance.nif_nipc },
      entity: entityInstance,
      locations: [locationInstances[0]],
      contacts,
      links: {
        allPatrons: { href: "/patrons", method: "GET" },
        self: { href: `/patrons/${entityInstance.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${entityInstance.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${entityInstance.nif_nipc}`, method: "DELETE" },
      },
    });

    res.status(201).json(response);
  } catch (e) {
    await transaction.rollback();
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.name === "SequelizeUniqueConstraintError") {
      next(conflictError([{ message: e.message }]));
    } else if (e.status && e.status < 500) {
      next(e);
    } else {
      console.error('[patrons] create error:', e?.message, e?.original?.sqlMessage ?? '');
      next(genericError("Error Creating Patron"));
    }
  }
};

export const getPatron = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const entity = await Entities.findOne({
      where: { nif_nipc, role: "patron" },
      include: patronInclude,
    });
    if (!entity) return next(notFoundError("Patron", nif_nipc));

    const response = formatResponse({
      resource: { nif_nipc: entity.nif_nipc },
      entity,
      locations: entity.locations,
      contacts: entity.Contacts,
      links: {
        self: { href: `/patrons/${entity.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${entity.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${entity.nif_nipc}`, method: "DELETE" },
      },
    });

    res.json(response);
  } catch (e) {
    next(genericError("Erro fetching patron"));
  }
};

export const getAllPatrons = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  const { where, include } = buildPatronSearch(req.query.q);
  try {
    const { count: total, rows } = await Entities.findAndCountAll({
      where,
      include,
      limit,
      offset,
      distinct: true,
    });

    const items = rows.map((entity) =>
      formatResponse({
        resource: { nif_nipc: entity.nif_nipc },
        entity,
        locations: entity.locations,
        contacts: entity.Contacts,
        links: {
          self: { href: `/patrons/${entity.nif_nipc}`, method: "GET" },
          update: { href: `/patrons/${entity.nif_nipc}`, method: "PATCH" },
          delete: { href: `/patrons/${entity.nif_nipc}`, method: "DELETE" },
        },
      })
    );

    res.json({
      items,
      total,
      limit,
      offset,
      links: buildPageLinks("/patrons", limit, offset, total),
      _links: { create: { href: "/patrons", method: "POST" } },
    });
  } catch (e) {
    next(genericError("Erro fetching patrons"));
  }
};

export const updatePatron = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { entity: entityData, locations, contacts } = req.body;
  const transaction = await Entities.sequelize.transaction();

  try {
    const entity = await Entities.findOne({
      where: { nif_nipc, role: "patron" },
      transaction,
    });
    if (!entity) return next(notFoundError("Patron", nif_nipc));

    if (entityData && entityData.password) {
      entityData.password = await hashPassword(entityData.password);
    }

    await syncEntityRelations({
      entity: entityData,
      locations,
      contacts,
      transaction,
      entityInstance: entity,
      replaceLocations: Array.isArray(locations),
      replaceContacts: Array.isArray(contacts),
    });

    await transaction.commit();

    const refreshed = await Entities.findOne({
      where: { nif_nipc, role: "patron" },
      include: patronInclude,
    });
    if (!refreshed) return next(notFoundError("Patron", nif_nipc));

    const response = formatResponse({
      resource: { nif_nipc: refreshed.nif_nipc },
      entity: refreshed,
      locations: refreshed.locations,
      contacts: refreshed.Contacts,
      links: {
        self: { href: `/patrons/${refreshed.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${refreshed.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${refreshed.nif_nipc}`, method: "DELETE" },
      },
    });

    res.json(response);
  } catch (e) {
    await transaction.rollback();
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.name === "SequelizeUniqueConstraintError") {
      next(conflictError([{ message: e.message }]));
    } else if (e.status && e.status < 500) {
      next(e);
    } else {
      next(genericError("Error updating patron"));
    }
  }
};

export const deletePatron = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const transaction = await Entities.sequelize.transaction();

  try {
    const entity = await Entities.findOne({
      where: { nif_nipc, role: "patron" },
      transaction,
    });
    if (!entity) return next(notFoundError("Patron", nif_nipc));

    const locations = await entity.getLocations({ transaction });

    await Contacts.destroy({
      where: { entidade_nif_nipc: entity.nif_nipc },
      transaction,
    });

    if (locations.length) {
      await entity.removeLocations(locations, { transaction });
    }

    await Donations.destroy({ where: { mecena_nif_nipc: nif_nipc }, transaction });
    await entity.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (e) {
    await transaction.rollback();
    next(genericError("Error deleting patron"));
  }
};
