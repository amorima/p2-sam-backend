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
    iban: entity?.iban,
    locations: (locations || []).map(formatLocation),
    contacts: (contacts || []).map(formatContact),
});

export const formatResponse = ({ resource, entity, locations = [], contacts = [], links }) => ({
    ...resource,
    ...formatEntityBase({ entity, locations, contacts }),
    _links: links,
});