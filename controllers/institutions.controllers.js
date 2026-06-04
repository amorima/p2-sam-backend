import { Institutions, Entities, Locations, Contacts } from "../models/db.config.js";
import { genericError, notFoundError, conflictError, missingFieldError, sequelizeValidationError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import { formatResponse, entityInclude, syncEntityRelations, buildEntitySearch } from "../utils/entity.utils.js";
import { hashPassword } from "../utils/auth.utils.js";
import { sendRegistrationEmail } from "../utils/email.utils.js";

export const createInstitution = async (req, res, next) => {
  const { location, entity, contacts, institution } = req.body;

  const missingFields = [];
  if (!location) missingFields.push("location");
  if (!entity) missingFields.push("entity");
  if (!institution) missingFields.push("institution");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  const transaction = await Institutions.sequelize.transaction();

  try {
    // Automatically set role for institution
    const entityWithRole = { ...entity, role: 'institution' };
    
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
    const existingInstitution = await Institutions.findByPk(entityInstance.nif_nipc, {
      transaction,
    });

    if (existingInstitution) {
      throw conflictError([
        { institution: "Institution already exists for this entity" },
      ]);
    }

    const institutionInstance = await Institutions.create(
      {
        ...institution,
        nif_nipc: entityInstance.nif_nipc,
      },
      { transaction }
    );

    await transaction.commit();

    sendRegistrationEmail({
      email: entity.email_login,
      nome_entidade: entityInstance.nome_entidade,
      nif_nipc: entityInstance.nif_nipc,
      role: "institution",
    });

    const response = formatResponse({
      resource: {
        nif_nipc: institutionInstance.nif_nipc,
        geo_latitude: institutionInstance.geo_latitude,
        geo_longitude: institutionInstance.geo_longitude,
        url_comprovativo_estatuto: institutionInstance.url_comprovativo_estatuto,
      },
      entity: entityInstance,
      locations: [locationInstance],
      contacts,
      links: {
        allInstitutions: { href: "/institutions", method: "GET" },
        self: { href: `/institutions/${institutionInstance.nif_nipc}`, method: "GET" },
        update: { href: `/institutions/${institutionInstance.nif_nipc}`, method: "PATCH" },
        delete: { href: `/institutions/${institutionInstance.nif_nipc}`, method: "DELETE" },
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
      next(genericError("Error Creating Institution"));
    }
  }
};

export const updateInstitution = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { institution: institutionData, entity: entityData, locations, contacts } =
    req.body;
  const transaction = await Institutions.sequelize.transaction();

  try {
    const institution = await Institutions.findByPk(nif_nipc, { transaction });
    if (!institution) return next(notFoundError("Institution", nif_nipc));

    const entity = await institution.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    if (institutionData) {
      // Hash password if provided
      if (institutionData.password) {
        institutionData.password = await hashPassword(institutionData.password);
      }
      await institution.update(institutionData, { transaction });
    }

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

    const refreshedInstitution = await Institutions.findByPk(nif_nipc, {
      include: entityInclude,
    });

    if (!refreshedInstitution) return next(notFoundError("Institution", nif_nipc));

    const response = formatResponse({
      resource: {
        nif_nipc: refreshedInstitution.nif_nipc,
        geo_latitude: refreshedInstitution.geo_latitude,
        geo_longitude: refreshedInstitution.geo_longitude,
        url_comprovativo_estatuto: refreshedInstitution.url_comprovativo_estatuto,
      },
      entity: refreshedInstitution.Entity,
      locations: refreshedInstitution.Entity?.locations,
      contacts: refreshedInstitution.Entity?.Contacts,
      links: {
        self: { href: `/institutions/${refreshedInstitution.nif_nipc}`, method: "GET" },
        update: { href: `/institutions/${refreshedInstitution.nif_nipc}`, method: "PATCH" },
        delete: { href: `/institutions/${refreshedInstitution.nif_nipc}`, method: "DELETE" },
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
      next(genericError("Error updating institution"));
    }
  }
};

export const getInstitution = async (req, res, next) => {
  const { nif_nipc } = req.params;

  try {
    const institution = await Institutions.findByPk(nif_nipc, {
      include: entityInclude,
    });

    if (!institution) return next(notFoundError("Institution", nif_nipc));

    const response = formatResponse({
      resource: {
        nif_nipc: institution.nif_nipc,
        geo_latitude: institution.geo_latitude,
        geo_longitude: institution.geo_longitude,
        url_comprovativo_estatuto: institution.url_comprovativo_estatuto,
      },
      entity: institution.Entity,
      locations: institution.Entity?.locations,
      contacts: institution.Entity?.Contacts,
      links: {
        self: { href: `/institutions/${institution.nif_nipc}`, method: "GET" },
        update: { href: `/institutions/${institution.nif_nipc}`, method: "PATCH" },
        delete: { href: `/institutions/${institution.nif_nipc}`, method: "DELETE" },
      },
    });

    res.json(response);
  } catch (e) {
    next(genericError("Erro fetching institution"));
  }
};

export const getAllInstitutions = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  const { where, include } = buildEntitySearch(req.query.q);
  try {
    const { count: total, rows } = await Institutions.findAndCountAll({
      where, include, limit, offset, distinct: true
    });

    const items = rows.map((institution) => {
      const entity = institution.Entity;
      return formatResponse({
        resource: {
          nif_nipc: institution.nif_nipc,
          geo_latitude: institution.geo_latitude,
          geo_longitude: institution.geo_longitude,
          url_comprovativo_estatuto: institution.url_comprovativo_estatuto,
        },
        entity,
        locations: entity?.locations,
        contacts: entity?.Contacts,
        links: {
          self: { href: `/institutions/${institution.nif_nipc}`, method: "GET" },
          update: { href: `/institutions/${institution.nif_nipc}`, method: "PATCH" },
          delete: { href: `/institutions/${institution.nif_nipc}`, method: "DELETE" },
        },
      });
    });

    res.json({
      items,
      total,
      limit,
      offset,
      links: buildPageLinks('/institutions', limit, offset, total),
      _links: { create: { href: "/institutions", method: "POST" } }
    });
  } catch (e) {
    console.error('[institutions] getAll error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Erro fetching institutions"));
  }
};

export const deleteInstitution = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const transaction = await Institutions.sequelize.transaction();

  try {
    const institution = await Institutions.findByPk(nif_nipc, { transaction });
    if (!institution) return next(notFoundError("Institution", nif_nipc));

    const entity = await institution.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    const locations = await entity.getLocations({ transaction });

    await Contacts.destroy({
      where: { entidade_nif_nipc: entity.nif_nipc },
      transaction,
    });

    if (locations.length) {
      await entity.removeLocations(locations, { transaction });
    }

    await institution.destroy({ transaction });
    await entity.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (e) {
    await transaction.rollback();
    next(genericError("Error deleting institution"));
  }
};