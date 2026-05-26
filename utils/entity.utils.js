import { Entities, Locations, Contacts } from "../models/db.config.js";

export const formatLocation = (location) => ({
    codigo_postal: location.codigo_postal,
    concelho: location.concelho,
    distrito: location.distrito,
    freguesia: location.freguesia,
    pais: location.pais,
    rua: location.rua,
    n_porta: location.n_porta,
});

export const formatContact = (contact) => ({
    contacto: contact.contacto,
    nome_contacto: contact.nome_contacto,
    descricao: contact.descricao,
});

export const formatEntityBase = ({ entity, locations = [], contacts = [] }) => ({
    nome_entidade: entity?.nome_entidade,
    email_login: entity?.email_login,
    iban: entity?.iban,
    profile_pic: entity?.profile_pic ?? null,
    blocked: Boolean(entity?.blocked),
    reason: entity?.reason ?? null,
    locations: (locations || []).map(formatLocation),
    contacts: (contacts || []).map(formatContact),
});

export const formatResponse = ({ resource, entity, locations = [], contacts = [], links }) => ({
    ...resource,
    ...formatEntityBase({ entity, locations, contacts }),
    _links: links,
});

export const syncEntityRelations = async ({
    entity,
    locations = [],
    contacts = [],
    transaction,
    entityInstance = null,
    replaceLocations = false,
    replaceContacts = false,
}) => {
    if (!entityInstance) {
        const [createdEntity, entityCreated] = await Entities.findOrCreate({
            where: { nif_nipc: entity.nif_nipc },
            defaults: entity,
            transaction,
        });

        if (!entityCreated) {
            await createdEntity.update(entity, { transaction });
        }

        entityInstance = createdEntity;
    } else if (entity) {
        await entityInstance.update(entity, { transaction });
    }

    const locationInstances = [];
    for (const location of locations) {
        const [locationInstance, locationCreated] = await Locations.findOrCreate({
            where: { codigo_postal: location.codigo_postal },
            defaults: location,
            transaction,
        });

        if (!locationCreated) {
            await locationInstance.update(location, { transaction });
        }

        locationInstances.push(locationInstance);
    }

    if (locationInstances.length) {
        if (replaceLocations) {
            await entityInstance.setLocations(locationInstances, { transaction });
        } else {
            for (const locationInstance of locationInstances) {
                await entityInstance.addLocation(locationInstance, { transaction });
            }
        }
    }

    if (Array.isArray(contacts)) {
        if (replaceContacts) {
            await Contacts.destroy({
                where: { entidade_nif_nipc: entityInstance.nif_nipc },
                transaction,
            });
        }

        if (contacts.length) {
            const contactsList = contacts.map((c) => ({
                ...c,
                entidade_nif_nipc: entityInstance.nif_nipc,
            }));

            await Contacts.bulkCreate(contactsList, {
                transaction,
                ignoreDuplicates: !replaceContacts,
            });
        }
    }

    return { entityInstance, locationInstances };
};

export const entityInclude = [
  {
    model: Entities,
    attributes: ["nif_nipc", "nome_entidade", "email_login", "iban", "profile_pic", "blocked", "reason"],
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
];