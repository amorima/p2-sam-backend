import { Leads, Panels, Citizens, Lockers, NeedItem } from "../models/db.config.js";
import { genericError, notFoundError, missingFieldError, conflictError, validationError } from "../utils/error.utils.js";

export const createLead = async (req, res, next) => {
  const { id_painel, nome_cidadao, contacto_cidadao, rgpd, id_pedido, id_item, pin_entrega, id_locker } = req.body;
  const missingFields = [];

  if (!nome_cidadao) missingFields.push("nome_cidadao");
  if (!contacto_cidadao) missingFields.push("contacto_cidadao");
  if (!id_pedido) missingFields.push("id_pedido");
  if (!id_item) missingFields.push("id_item");
  if (!pin_entrega) missingFields.push("pin_entrega");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  const transaction = await Leads.sequelize.transaction();

  try {
    if (id_painel) {
      const panel = await Panels.findByPk(id_painel);
      if (!panel) {
        await transaction.rollback();
        return next(notFoundError("Panel", id_painel));
      }
    }

    let citizen = await Citizens.findOne({ where: { contacto: contacto_cidadao }, transaction });
    if (!citizen) {
      if (rgpd === undefined || rgpd === null) {
        await transaction.rollback();
        return next(missingFieldError(["rgpd"]));
      }
      citizen = await Citizens.create(
        { nome: nome_cidadao, contacto: contacto_cidadao, rgpd, blocked: 0 },
        { transaction }
      );
    }

    if (citizen.blocked) {
      await transaction.rollback();
      return next(conflictError([{ contacto_cidadao: "Citizen is suspended and cannot participate in leads" }]));
    }

    const needItem = await NeedItem.findByPk(id_item);
    if (!needItem) {
      await transaction.rollback();
      return next(notFoundError("NeedItem", id_item));
    }
    if (needItem.id_pedido !== id_pedido) {
      await transaction.rollback();
      return next(validationError([{ id_item: "Item does not belong to provided pedido" }]));
    }

    const existingLead = await Leads.findOne({ where: { id_item }, transaction });
    if (existingLead) {
      await transaction.rollback();
      return next(conflictError([{ id_item: "A lead already exists for this item" }]));
    }

    if (id_locker) {
      const locker = await Lockers.findByPk(id_locker);
      if (!locker) {
        await transaction.rollback();
        return next(notFoundError("Locker", id_locker));
      }
    }

    const lead = await Leads.create(
      {
        id_painel: id_painel || null,
        nome_cidadao,
        contacto_cidadao,
        id_pedido,
        id_item,
        item_pedido: needItem.tipo_bem_servico,
        pin_entrega,
        id_locker: id_locker || null,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(lead);
  } catch (e) {
    await transaction.rollback();
    console.error("[leads] create error:", e?.name, e?.message, e?.original?.sqlMessage ?? '', e?.errors ?? '');
    if (req.query.debug === '1') {
      return res.status(500).json({
        description: "Error creating lead (debug)",
        name: e?.name,
        message: e?.message,
        sql: e?.original?.sqlMessage,
        errors: e?.errors?.map(er => ({ path: er.path, message: er.message, value: er.value })) ?? []
      });
    }
    next(genericError("Error creating lead"));
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    const leads = await Leads.findAll({ include: [Citizens, Panels, Lockers] });
    res.json(leads);
  } catch (e) {
    console.error("[leads] getAll error:", e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching leads"));
  }
};

export const getLead = async (req, res, next) => {
  const { id_lead } = req.params;

  try {
    const lead = await Leads.findByPk(id_lead, { include: [Citizens, Panels, Lockers] });
    if (!lead) return next(notFoundError("Lead", id_lead));
    res.json(lead);
  } catch (e) {
    console.error("[leads] get error:", e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching lead"));
  }
};

export const updateLead = async (req, res, next) => {
  const { id_lead } = req.params;
  const { id_painel, id_locker, estado, pin_entrega, id_item, id_pedido } = req.body;

  try {
    const lead = await Leads.findByPk(id_lead);
    if (!lead) return next(notFoundError("Lead", id_lead));

    const updates = {};

    if (id_painel) {
      const panel = await Panels.findByPk(id_painel);
      if (!panel) return next(notFoundError("Panel", id_painel));
      updates.id_painel = id_painel;
    }

    if (id_locker !== undefined) {
      if (id_locker !== null) {
        const locker = await Lockers.findByPk(id_locker);
        if (!locker) return next(notFoundError("Locker", id_locker));
      }
      updates.id_locker = id_locker;
    }

    if (id_item) {
      const needItem = await NeedItem.findByPk(id_item);
      if (!needItem) return next(notFoundError("NeedItem", id_item));
      const existingLead = await Leads.findOne({ where: { id_item } });
      if (existingLead && existingLead.id_lead !== lead.id_lead) {
        return next(conflictError([{ id_item: "Another lead already exists for this item" }]));
      }
      updates.id_item = id_item;
      updates.item_pedido = needItem.tipo_bem_servico;
    }

    if (id_pedido) updates.id_pedido = id_pedido;
    if (estado) updates.estado = estado;
    if (pin_entrega) updates.pin_entrega = pin_entrega;

    await lead.update(updates);
    res.json(lead);
  } catch (e) {
    next(genericError("Error updating lead"));
  }
};

export const deleteLead = async (req, res, next) => {
  const { id_lead } = req.params;

  try {
    const lead = await Leads.findByPk(id_lead);
    if (!lead) return next(notFoundError("Lead", id_lead));
    await lead.destroy();
    res.status(204).send();
  } catch (e) {
    next(genericError("Error deleting lead"));
  }
};

export const validateLead = async (req, res, next) => {
  const { id_lead, pin_entrega } = req.body;
  const missingFields = [];

  if (!id_lead) missingFields.push("id_lead");
  if (!pin_entrega) missingFields.push("pin_entrega");

  if (missingFields.length) {
    return next(missingFieldError(missingFields));
  }

  try {
    const lead = await Leads.findByPk(id_lead);
    if (!lead) return next(notFoundError("Lead", id_lead));
    if (lead.pin_entrega !== pin_entrega) {
      return next(validationError([{ pin_entrega: "Pin does not match" }]));
    }

    if (lead.estado === "ENTREGUE") {
      return res.json({ message: "Lead already validated", lead });
    }

    await lead.update({ estado: "ENTREGUE" });
    res.json(lead);
  } catch (e) {
    next(genericError("Error validating lead"));
  }
};