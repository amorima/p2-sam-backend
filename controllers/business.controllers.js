import { Business, Entities, Locations, Contacts } from "../models/db.config.js";
import { genericError, notFoundError, conflictError, missingFieldError, sequelizeValidationError } from "../utils/error.utils.js";
import { formatResponse, entityInclude } from "../utils/entityHelper.utils.js";


export const createBusiness = async (req, res, next) => {
  const { location, entity, contacts, business } = req.body;

  const missingFields = [];
  if (!location) missingFields.push("location");
  if (!entity) missingFields.push("entity");
  if (!business) missingFields.push("business");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  const transaction = await Business.sequelize.transaction();

  try {
    const [locationInstance, locationCreated] = await Locations.findOrCreate({
      where: { codigo_postal: location.codigo_postal },
      defaults: location,
      transaction,
    });

    if (!locationCreated) {
      await locationInstance.update(location, { transaction });
    }

    const [entityInstance, entityCreated] = await Entities.findOrCreate({
      where: { nif_nipc: entity.nif_nipc },
      defaults: entity,
      transaction,
    });

    if (!entityCreated) {
      await entityInstance.update(entity, { transaction });
    }

    await entityInstance.addLocation(locationInstance, { transaction });

    if (contacts?.length) {
      const contactsList = contacts.map((c) => ({
        ...c,
        entidade_nif_nipc: entityInstance.nif_nipc,
      }));

      await Contacts.bulkCreate(contactsList, {
        transaction,
        ignoreDuplicates: true,
      });
    }

    const existingBusiness = await Business.findByPk(entityInstance.nif_nipc, {
      transaction,
    });

    if (existingBusiness) {
      throw conflictError([
        { business: "Business already exists for this entity" },
      ]);
    }

    const businessInstance = await Business.create(
      {
        ...business,
        nif_nipc: entityInstance.nif_nipc,
      },
      { transaction }
    );

    await transaction.commit();

    const businessResponse = formatResponse({
      resource: {
        nif_nipc: businessInstance.nif_nipc,
        geo_latitude: businessInstance.geo_latitude,
        geo_longitude: businessInstance.geo_longitude,
        url_certidao_permanente: businessInstance.url_certidao_permanente,
        inicio_atividade: businessInstance.inicio_atividade,
      },
      entity: entityInstance,
      locations: [locationInstance],
      contacts,
      links: {
        allBusinesses: { href: "/business", method: "GET" },
        self: {
          href: `/business/${businessInstance.nif_nipc}`,
          method: "GET",
        },
        update: {
          href: `/business/${businessInstance.nif_nipc}`,
          method: "PATCH",
        },
        delete: {
          href: `/business/${businessInstance.nif_nipc}`,
          method: "DELETE",
        },
        postOffer: {
          href: `/business/${businessInstance.nif_nipc}/offers`,
          method: "POST",
        },
      },
    });

    res.status(201).json(businessResponse);
  } catch (e) {
    await transaction.rollback();
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.name === "SequelizeUniqueConstraintError") {
      next(conflictError([{ message: e.message }]));
    } else {
      next(genericError("Error Creating Business"));
    }
  }
};

export const updateBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { business: businessData, entity: entityData, locations, contacts } = req.body;
  const transaction = await Business.sequelize.transaction();

  try {
    const business = await Business.findByPk(nif_nipc, { transaction });
    if (!business) return next(notFoundError("Business", nif_nipc));

    const entity = await business.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    if (businessData) {
      await business.update(businessData, { transaction });
    }

    if (entityData) {
      await entity.update(entityData, { transaction });
    }

    if (Array.isArray(locations)) {
      const locationInstances = [];

      for (const location of locations) {
        const [locationInstance, created] = await Locations.findOrCreate({
          where: { codigo_postal: location.codigo_postal },
          defaults: location,
          transaction,
        });

        if (!created) {
          await locationInstance.update(location, { transaction });
        }

        locationInstances.push(locationInstance);
      }

      await entity.setLocations(locationInstances, { transaction });
    }

    if (Array.isArray(contacts)) {
      await Contacts.destroy({
        where: { entidade_nif_nipc: entity.nif_nipc },
        transaction,
      });

      if (contacts.length) {
        const contactsList = contacts.map((c) => ({
          ...c,
          entidade_nif_nipc: entity.nif_nipc,
        }));
        await Contacts.bulkCreate(contactsList, { transaction });
      }
    }

    await transaction.commit();

    const refreshedBusiness = await Business.findByPk(nif_nipc, {
      include: entityInclude,
    });

    if (!refreshedBusiness) return next(notFoundError("Business", nif_nipc));

    const response = formatResponse({
      resource: {
        nif_nipc: refreshedBusiness.nif_nipc,
        geo_latitude: refreshedBusiness.geo_latitude,
        geo_longitude: refreshedBusiness.geo_longitude,
        url_certidao_permanente:
          refreshedBusiness.url_certidao_permanente,
        inicio_atividade: refreshedBusiness.inicio_atividade,
      },
      entity: refreshedBusiness.Entity,
      locations: refreshedBusiness.Entity?.locations,
      contacts: refreshedBusiness.Entity?.Contacts,
      links: {
        self: {
          href: `/business/${refreshedBusiness.nif_nipc}`,
          method: "GET",
        },
        update: {
          href: `/business/${refreshedBusiness.nif_nipc}`,
          method: "PATCH",
        },
        delete: {
          href: `/business/${refreshedBusiness.nif_nipc}`,
          method: "DELETE",
        },
        postOffer: {
          href: `/business/${refreshedBusiness.nif_nipc}/offers`,
          method: "POST",
        },
        all: { href: "/business", method: "GET" },
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
      next(genericError("Error updating business"));
    }
  }
};

export const getBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  try {
    const business = await Business.findByPk(nif_nipc, {
      include: entityInclude,
    });

    if (!business) return next(notFoundError("Business", nif_nipc));

    const entity = business.Entity;

    const response = formatResponse({
        resource: {
            nif_nipc: business.nif_nipc,
            geo_latitude: business.geo_latitude,
            geo_longitude: business.geo_longitude,
            url_certidao_permanente: business.url_certidao_permanente,
            inicio_atividade: business.inicio_atividade,
        },
        entity,
        locations: entity?.locations,
        contacts: entity?.Contacts,
        links: {
            self: { href: `/business/${business.nif_nipc}`, method: "GET" },
            update: { href: `/business/${business.nif_nipc}`, method: "PATCH" },
            delete: { href: `/business/${business.nif_nipc}`, method: "DELETE" },
            postOffer: { href: `/business/${business.nif_nipc}/offers`, method: "POST" },
            all: { href: "/business", method: "GET" },
        },
    })

    res.json(response);
  } catch (e) {
    next(genericError("Erro fetching business"));
  }
};

export const getAllBusiness = async (req, res, next) => {
  try {
    const businesses = await Business.findAll({
      include: entityInclude,
    });

    const bList = businesses.map((b) => {
    const entity = b.Entity;
        return formatResponse({
            resource: {
                nif_nipc: b.nif_nipc,
                geo_latitude: b.geo_latitude,
                geo_longitude: b.geo_longitude,
                url_certidao_permanente: b.url_certidao_permanente,
                inicio_atividade: b.inicio_atividade,
            },
            entity,
            locations: entity?.locations,
            contacts: entity?.Contacts,
            links: {
                self: { href: `/business/${b.nif_nipc}`, method: "GET" },
                update: { href: `/business/${b.nif_nipc}`, method: "PATCH" },
                delete: { href: `/business/${b.nif_nipc}`, method: "DELETE" },
                postOffer: { href: `/business/${b.nif_nipc}/offers`, method: "POST" },
            },
        });
    });

    res.json({
      data: bList,
      _links: { create: { href: "/business", method: "POST" } },
    });
  } catch (e) {
    next(genericError("Erro fetching businesses"));
  }
};

export const deleteBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const transaction = await Business.sequelize.transaction();

  try {
    const business = await Business.findByPk(nif_nipc, { transaction });
    if (!business) return next(notFoundError("Business", nif_nipc));

    const entity = await business.getEntity({ transaction });
    if (!entity) return next(notFoundError("Entity", nif_nipc));

    const locations = await entity.getLocations({ transaction });

    await Contacts.destroy({
      where: { entidade_nif_nipc: entity.nif_nipc },
      transaction,
    });

    if (locations.length) {
      await entity.removeLocations(locations, { transaction });
    }

    await business.destroy({ transaction });
    await entity.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (e) {
    await transaction.rollback();
    next(genericError("Error deleting business"));
  }
};