import { Patrons, Entities, Locations, Contacts } from "../models/db.config.js";
import { genericError, notFoundError, conflictError, missingFieldError, sequelizeValidationError } from "../utils/error.utils.js";
import { formatResponse, entityInclude, syncEntityRelations } from "../utils/entity.utils.js";
import { hashPassword } from "../utils/auth.utils.js";

export const createPatron = async (req, res, next) => {
  const { location, entity, contacts } = req.body;

  const missingFields = [];
  if (!location) missingFields.push("location");
  if (!entity) missingFields.push("entity");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  const transaction = await Patrons.sequelize.transaction();

  try {
    // Automatically set role for patron
    const entityWithRole = { ...entity, role: 'patron' };
    
    // Hash password
    if (entityWithRole.password) {
      entityWithRole.password = await hashPassword(entityWithRole.password);
    }

    const { entityInstance, locationInstances } = await syncEntityRelations({
      entity: entityWithRole,
      locations: [location],
      contacts,
      transaction,
    });

    const locationInstance = locationInstances[0];
    const existingPatron = await Patrons.findByPk(entityInstance.nif_nipc, { transaction });
    if (existingPatron) {
      throw conflictError([{ patron: "Patron already exists for this entity" }]);
    }

    const patronInstance = await Patrons.create(
      { nif_nipc: entityInstance.nif_nipc },
      { transaction }
    );

    await transaction.commit();

    const response = formatResponse({
      resource: { nif_nipc: patronInstance.nif_nipc },
      entity: entityInstance,
      locations: [locationInstance],
      contacts,
      links: {
        allPatrons: { href: "/patrons", method: "GET" },
        self: { href: `/patrons/${patronInstance.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${patronInstance.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${patronInstance.nif_nipc}`, method: "DELETE" },
      },
    });

    res.status(201).json(response);
  } catch (e) {
    await transaction.rollback();
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.name === "SequelizeUniqueConstraintError") {
      next(conflictError([{ message: e.message }]));
    } else {
      next(genericError("Error Creating Patron"));
    }
  }
};

export const getPatron = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const patron = await Patrons.findByPk(nif_nipc, { include: entityInclude });
    if (!patron) return next(notFoundError("Patron", nif_nipc));

    const response = formatResponse({
      resource: { nif_nipc: patron.nif_nipc },
      entity: patron.Entity,
      locations: patron.Entity?.locations,
      contacts: patron.Entity?.Contacts,
      links: {
        self: { href: `/patrons/${patron.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${patron.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${patron.nif_nipc}`, method: "DELETE" },
      },
    });

    res.json(response);
  } catch (e) {
    next(genericError("Erro fetching patron"));
  }
};

export const getAllPatrons = async (req, res, next) => {
  try {
    const patrons = await Patrons.findAll({ include: entityInclude });

    const data = patrons.map((patron) => {
      const entity = patron.Entity;
      return formatResponse({
        resource: { nif_nipc: patron.nif_nipc },
        entity,
        locations: entity?.locations,
        contacts: entity?.Contacts,
        links: {
          self: { href: `/patrons/${patron.nif_nipc}`, method: "GET" },
          update: { href: `/patrons/${patron.nif_nipc}`, method: "PATCH" },
          delete: { href: `/patrons/${patron.nif_nipc}`, method: "DELETE" },
        },
      });
    });

    res.json({
      data,
      _links: { create: { href: "/patrons", method: "POST" } },
    });
  } catch (e) {
    next(genericError("Erro fetching patrons"));
  }
};

export const updatePatron = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { entity: entityData, locations, contacts } = req.body;
  const transaction = await Patrons.sequelize.transaction();

  try {
    const patron = await Patrons.findByPk(nif_nipc, { transaction });
    if (!patron) return next(notFoundError("Patron", nif_nipc));

    const entity = await patron.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

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

    const refreshedPatron = await Patrons.findByPk(nif_nipc, { include: entityInclude });
    if (!refreshedPatron) return next(notFoundError("Patron", nif_nipc));

    const response = formatResponse({
      resource: { nif_nipc: refreshedPatron.nif_nipc },
      entity: refreshedPatron.Entity,
      locations: refreshedPatron.Entity?.locations,
      contacts: refreshedPatron.Entity?.Contacts,
      links: {
        self: { href: `/patrons/${refreshedPatron.nif_nipc}`, method: "GET" },
        update: { href: `/patrons/${refreshedPatron.nif_nipc}`, method: "PATCH" },
        delete: { href: `/patrons/${refreshedPatron.nif_nipc}`, method: "DELETE" },
      },
    });

    res.json(response);
  } catch (e) {
    await transaction.rollback();
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.name === "SequelizeUniqueConstraintError") {
      next(conflictError([{ message: e.message }]));
    } else {
      next(genericError("Error updating patron"));
    }
  }
};

export const deletePatron = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const transaction = await Patrons.sequelize.transaction();

  try {
    const patron = await Patrons.findByPk(nif_nipc, { transaction });
    if (!patron) return next(notFoundError("Patron", nif_nipc));

    const entity = await patron.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    const locations = await entity.getLocations({ transaction });

    await Contacts.destroy({
      where: { entidade_nif_nipc: entity.nif_nipc },
      transaction,
    });

    if (locations.length) {
      await entity.removeLocations(locations, { transaction });
    }

    await patron.destroy({ transaction });
    await entity.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (e) {
    await transaction.rollback();
    next(genericError("Error deleting patron"));
  }
};