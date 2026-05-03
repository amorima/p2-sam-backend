import { Business, Entities, Locations, Contacts } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";

export const createBusiness = async (req, res, next) => {
  const { location, entity, contacts, business } = req.body;
  const transaction = await Business.sequelize.transaction();

  try {
    const [locationInstance] = await Locations.findOrCreate({
      where: { codigo_postal: location.codigo_postal },
      defaults: location,
      transaction
    });

    const entityInstance = await Entities.create({ ...entity }, { transaction });

    await entityInstance.addLocation(locationInstance, { transaction });

    if (contacts?.length) {
      const contactsList = contacts.map(c => ({
        ...c,
        entidade_nif_nipc: entityInstance.nif_nipc,
      }));
      await Contacts.bulkCreate(contactsList, { transaction });
    }

    const businessInstance = await Business.create(
      {
        ...business,
        nif_nipc: entityInstance.nif_nipc,
      },
      { transaction }
    );

    await transaction.commit();

    const businessResponse = {
        nif_nipc: businessInstance.nif_nipc,
        geo_latitude: businessInstance.geo_latitude,
        geo_longitude: businessInstance.geo_longitude,
        url_certidao_permanente: businessInstance.url_certidao_permanente,
        inicio_atividade: businessInstance.inicio_atividade,
        nome_entidade: entityInstance.nome_entidade,
        iban: entityInstance.iban,
        locations: [{
            codigo_postal: locationInstance.codigo_postal,
            concelho: locationInstance.concelho,
            distrito: locationInstance.distrito,
            freguesia: locationInstance.freguesia,
            pais: locationInstance.pais,
            rua: locationInstance.rua,
            n_porta: locationInstance.n_porta,
        }],
        contacts: contacts?.map(({ contacto, nome_contacto, descricao }) => ({
            contacto, nome_contacto, descricao
        }))
      ,
      _links: {
        allBusinesses: { href: "/business", method: "GET" },
        self: { href: `/business/${businessInstance.nif_nipc}`, method: "GET" },
        update: { href: `/business/${businessInstance.nif_nipc}`, method: "PATCH" },
        delete: { href: `/business/${businessInstance.nif_nipc}`, method: "DELETE" },
        postOffer: { href: `/business/${businessInstance.nif_nipc}/offers`, method: "POST" }
      }
    };

    res.status(201).json(businessResponse);
    } catch (e) {
        await transaction.rollback();
        console.error("createBusiness error:", e);
        if (e.name === "SequelizeValidationError") next(sequelizeValidationError(e.errors));
        else next(genericError("Error Creating Business"));
    }
};

export const updateBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  try {
    const business = await Business.findByPk(nif_nipc);
    if (!business) return next(notFoundError("Business", nif_nipc));

    const updatedBusiness = await business.update(req.body);

    const response = {
      ...updatedBusiness.toJSON(),
      _links: {
        self: { href: `/business/${updatedBusiness.nif_nipc}`, method: "GET" },
        update: { href: `/business/${updatedBusiness.nif_nipc}`, method: "PATCH" },
        delete: { href: `/business/${updatedBusiness.nif_nipc}`, method: "DELETE" },
        postOffer: { href: `/business/${updatedBusiness.nif_nipc}/offers`, method: "POST" },
        all: { href: "/business", method: "GET" }
      }
    }

    res.json(response);
  } catch (e) {
    if (e.name === "SequelizeValidationError") next(sequelizeValidationError(e.errors));
    else next(genericError("Error updating business"));
  }
};

export const getBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  try {
    const business = await Business.findByPk(nif_nipc, {
      include: [
        {
          model: Entities,
          attributes: ["nif_nipc", "nome_entidade", "iban"],
          include: [
            {
              model: Locations,
              as: "locations",
              through: { attributes: [] },
              attributes: [
                "codigo_postal",
                "concelho",
                "distrito",
                "freguesia",
                "pais",
                "rua",
                "n_porta",
              ],
            },
            {
              model: Contacts,
              attributes: ["contacto", "nome_contacto", "descricao"],
            },
          ],
        },
      ],
    });

    if (!business) return next(notFoundError("Business", nif_nipc));

    const entity = business.Entity && {
      nif_nipc: business.Entity.nif_nipc,
      nome_entidade: business.Entity.nome_entidade,
      iban: business.Entity.iban,
      locations: business.Entity.locations?.map(location => ({
        codigo_postal: location.codigo_postal,
        concelho: location.concelho,
        distrito: location.distrito,
        freguesia: location.freguesia,
        pais: location.pais,
        rua: location.rua,
        n_porta: location.n_porta,
      })),
      contacts: business.Entity.Contacts?.map(contact => ({
        contacto: contact.contacto,
        nome_contacto: contact.nome_contacto,
        descricao: contact.descricao,
      })),
    };

    const response = {
      nif_nipc: business.nif_nipc,
      geo_latitude: business.geo_latitude,
      geo_longitude: business.geo_longitude,
      url_certidao_permanente: business.url_certidao_permanente,
      inicio_atividade: business.inicio_atividade,
      entity,
      _links: {
        self: { href: `/business/${business.nif_nipc}`, method: "GET" },
        update: { href: `/business/${business.nif_nipc}`, method: "PATCH" },
        delete: { href: `/business/${business.nif_nipc}`, method: "DELETE" },
        postOffer: { href: `/business/${business.nif_nipc}/offers`, method: "POST" },
        all: { href: "/business", method: "GET" },
      },
    };

    res.json(response);
  } catch (e) {
    next(genericError("Erro fetching business"));
  }
};

export const getAllBusiness = async (req, res, next) => {
  try {
    const businesses = await Business.findAll({
      include: [
        {
          model: Entities,
          attributes: ["nif_nipc", "nome_entidade", "iban"],
          include: [
            {
              model: Locations,
              as: "locations",
              through: { attributes: [] },
              attributes: [
                "codigo_postal",
                "concelho",
                "distrito",
                "freguesia",
                "pais",
                "rua",
                "n_porta",
              ],
            },
          ],
        },
      ],
    });

    const bList = businesses.map(b => ({
      nif_nipc: b.nif_nipc,
      geo_latitude: b.geo_latitude,
      geo_longitude: b.geo_longitude,
      url_certidao_permanente: b.url_certidao_permanente,
      inicio_atividade: b.inicio_atividade,
      entity: b.Entity && {
        nif_nipc: b.Entity.nif_nipc,
        nome_entidade: b.Entity.nome_entidade,
        iban: b.Entity.iban,
        locations: b.Entity.locations?.map(location => ({
          codigo_postal: location.codigo_postal,
          concelho: location.concelho,
          distrito: location.distrito,
          freguesia: location.freguesia,
          pais: location.pais,
          rua: location.rua,
          n_porta: location.n_porta,
        })),
      },
      _links: {
        self: { href: `/business/${b.nif_nipc}`, method: "GET" },
        update: { href: `/business/${b.nif_nipc}`, method: "PATCH" },
        delete: { href: `/business/${b.nif_nipc}`, method: "DELETE" },
        postOffer: { href: `/business/${b.nif_nipc}/offers`, method: "POST" },
      },
    }));

    res.json({
      data: bList,
      _links: { create: { href: "/business", method: "POST" } },
    });
  } catch (e) {
    next(genericError("Erro fetching businesses"));
  }
};

export const deleteBusiness = async(req, res, next) => {
    const { nif_nipc } = req.params;
    try{
        const business = await Business.findByPk(nif_nipc);
        if(!business) return next(notFoundError("Business", nif_nipc))

        await business.destroy();

        res.status(204).send()
    } catch(e){
        next(genericError("Error deleting business"))
    }
}