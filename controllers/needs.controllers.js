import { Op } from "sequelize";
import { Needs, NeedItem, Institutions, Entities } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError, forbiddenError, unauthorizedError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import {
  buildNeedItems,
  ensureGoodsServicesForItems,
} from "../utils/need.utils.js";
import { persistNotification, emitToAdmins, emitToUser } from "../utils/socket.js";

export const createNeed = async (req, res, next) => {
  const { nif_nipc, estado, urgente, items } = req.body;

  try {
    const transaction = await Needs.sequelize.transaction();

    try {
      await ensureGoodsServicesForItems(items, transaction);

      const needData = { nif_nipc };
      if (estado !== undefined) needData.estado = estado;
      if (urgente !== undefined) needData.urgente = urgente;
      
      const need = await Needs.create(needData, { transaction });
      const createdItems = await NeedItem.bulkCreate(buildNeedItems(items, need.id_pedido), {
        transaction,
      });
      await transaction.commit();
      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 422 && e.errors) {
      next(e);
    } else {
      console.error("[needs] create error:", e?.message, e?.original?.sqlMessage ?? '');
      next(genericError("Error creating need"));
    }
  }
};

export const getNeed = async (req, res, next) => {
  const { id_need } = req.params;

  try {
    const need = await Needs.findByPk(id_need, { include: [NeedItem] });
    if (!need) return next(notFoundError("Need", id_need));
    res.json({ need });
  } catch (e) {
    next(genericError("Error fetching need"));
  }
};

// Build the WHERE for searching needs by institution NIF or name.
const buildNeedSearch = (q) => {
  const term = String(q ?? "").trim();
  if (!term) return null;
  const like = `%${term}%`;
  return {
    [Op.or]: [
      { nif_nipc: { [Op.like]: like } },
      { "$institution.Entity.nome_entidade$": { [Op.like]: like } },
    ],
  };
};

const NEEDS_SORT_FIELDS = ['id_pedido', 'data', 'estado', 'urgente']

function parseNeedsOrder(query) {
  const field = NEEDS_SORT_FIELDS.includes(query.sort_by) ? query.sort_by : 'id_pedido'
  const dir   = query.sort_dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  return [[field, dir]]
}

export const getNeedsStats = async (req, res, next) => {
  const search = buildNeedSearch(req.query.q)
  try {
    if (search) {
      // Two-step: resolve matching ids first (same join strategy as getAllNeeds)
      const { count: total, rows: idRows } = await Needs.findAndCountAll({
        where: search,
        include: [{ model: Institutions, required: true, attributes: [], include: [{ model: Entities, attributes: [] }] }],
        attributes: ['id_pedido'],
        subQuery: false
      })
      const ids = idRows.map(r => r.id_pedido)
      if (!ids.length) return res.json({ total: 0, pendentes: 0, aceites: 0, urgentes: 0 })
      const [pendentes, aceites, urgentes] = await Promise.all([
        Needs.count({ where: { id_pedido: ids, estado: 'PENDENTE' } }),
        Needs.count({ where: { id_pedido: ids, estado: 'ACEITE' } }),
        Needs.count({ where: { id_pedido: ids, urgente: true, estado: 'PENDENTE' } })
      ])
      return res.json({ total, pendentes, aceites, urgentes })
    }
    const [total, pendentes, aceites, urgentes] = await Promise.all([
      Needs.count(),
      Needs.count({ where: { estado: 'PENDENTE' } }),
      Needs.count({ where: { estado: 'ACEITE' } }),
      Needs.count({ where: { urgente: true, estado: 'PENDENTE' } })
    ])
    res.json({ total, pendentes, aceites, urgentes })
  } catch (e) {
    console.error('[needs] stats error:', e?.message)
    next(genericError('Error fetching need stats'))
  }
}

export const getAllNeeds = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  const search = buildNeedSearch(req.query.q);
  try {
    if (search) {
      // Two-step: the institution-name search is a 2-level join that Sequelize
      // can't hoist into the auto-subquery forced by the hasMany NeedItem +
      // limit. Resolve the matching ids first (belongsTo joins only, no hasMany
      // → subQuery:false is safe), then hydrate those needs with their items.
      const { count: total, rows: idRows } = await Needs.findAndCountAll({
        where: search,
        include: [{ model: Institutions, required: true, attributes: [], include: [{ model: Entities, attributes: [] }] }],
        attributes: ["id_pedido"],
        limit,
        offset,
        subQuery: false,
        order: parseNeedsOrder(req.query),
      });
      const ids = idRows.map((r) => r.id_pedido);
      const rows = ids.length
        ? await Needs.findAll({ where: { id_pedido: ids }, include: [NeedItem], order: parseNeedsOrder(req.query) })
        : [];
      return res.json({ items: rows.map((r) => r.toJSON()), total, limit, offset, links: buildPageLinks('/needs', limit, offset, total) });
    }

    const { count: total, rows } = await Needs.findAndCountAll({
      include: [NeedItem], limit, offset, distinct: true, order: parseNeedsOrder(req.query)
    });
    res.json({ items: rows.map(r => r.toJSON()), total, limit, offset, links: buildPageLinks('/needs', limit, offset, total) });
  } catch (e) {
    console.error('[needs] getAllNeeds error:', e?.message, e?.original?.sqlMessage ?? '');
    next(genericError("Error fetching needs"));
  }
};

export const updateNeed = async (req, res, next) => {
  const { id_need } = req.params;
  const { estado, items, nif_nipc, panelItemIds, businessMatches } = req.body;
  const updateData = {};

  if (estado !== undefined) updateData.estado = estado;
  if (nif_nipc !== undefined) updateData.nif_nipc = nif_nipc;

  try {
    const need = await Needs.findByPk(id_need);
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();

    try {
      if (Object.keys(updateData).length) {
        await need.update(updateData, { transaction });
      }

      // Persist which items were allocated to the citizen panel during approval
      // (publico = 1). The panel listing shows these regardless of distance.
      if (Array.isArray(panelItemIds)) {
        await NeedItem.update({ publico: 0 }, { where: { id_pedido: id_need }, transaction });
        if (panelItemIds.length) {
          await NeedItem.update(
            { publico: 1 },
            { where: { id_pedido: id_need, id_item: panelItemIds }, transaction }
          );
        }
      }

      // Persist business partner assignments made during approval.
      if (Array.isArray(businessMatches) && businessMatches.length) {
        for (const bm of businessMatches) {
          if (!bm.id_item || !bm.negocio_nif) continue
          await NeedItem.update(
            {
              match_negocio_nif: bm.negocio_nif,
              match_negocio_nome: bm.negocio_nome ?? null,
              match_negocio_estado: 'PENDENTE',
              match_negocio_motivo: null
            },
            { where: { id_item: bm.id_item, id_pedido: id_need }, transaction }
          )
        }
      }

      let updatedItems = [];
      if (items !== undefined) {
        await ensureGoodsServicesForItems(items, transaction);
        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(buildNeedItems(items, id_need), {
          transaction,
        });
      }

      await transaction.commit();

      // Notify each assigned business after the transaction is safe.
      if (Array.isArray(businessMatches)) {
        for (const bm of businessMatches) {
          if (!bm.negocio_nif) continue
          persistNotification({
            tipo: 'business_match',
            titulo: 'Novo pedido de parceria',
            corpo: `Foi-lhe atribuído um item no pedido #${id_need}`,
            destinatario: bm.negocio_nif,
            payload: { id_pedido: Number(id_need), id_item: bm.id_item }
          }).then(n => {
            emitToAdmins(n)
            emitToUser(bm.negocio_nif, n)
          })
        }
      }

      // Notify the institution if estado changed (e.g. admin approved/rejected)
      if (updateData.estado && need.nif_nipc) {
        const estadoLabel = { ACEITE: 'aprovado', REJEITADO: 'rejeitado', PENDENTE: 'em análise' }[updateData.estado] ?? updateData.estado;
        persistNotification({
          tipo: 'pedido_atualizado',
          titulo: 'Estado do Pedido Alterado',
          corpo: `O seu pedido #${id_need} foi ${estadoLabel}`,
          destinatario: need.nif_nipc,
          payload: { id_pedido: Number(id_need), estado: updateData.estado }
        }).then(n => {
          emitToAdmins(n);
          emitToUser(need.nif_nipc, n);
        });
      }

      res.json({ need, items: updatedItems.length ? updatedItems : undefined });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating need"));
    }
  }
};

export const businessResponse = async (req, res, next) => {
  const { id_need } = req.params
  const { id_item, estado, motivo } = req.body
  const negocio_nif = req.user.nif_nipc

  if (!['ACEITE', 'RECUSADO', 'CONCLUIDO'].includes(estado)) {
    return next(genericError('Estado inválido'))
  }

  try {
    const item = await NeedItem.findOne({
      where: { id_item, id_pedido: id_need, match_negocio_nif: negocio_nif }
    })
    if (!item) return next(forbiddenError('Item não atribuído a este negócio ou não encontrado'))

    await item.update({
      match_negocio_estado: estado,
      match_negocio_motivo: estado === 'RECUSADO' ? (motivo ?? null) : null
    })

    persistNotification({
      tipo: 'business_response',
      titulo: estado === 'ACEITE' ? 'Pedido aceite pelo negócio' : estado === 'RECUSADO' ? 'Pedido recusado pelo negócio' : 'Item concluído pelo negócio',
      corpo: `O negócio ${negocio_nif} marcou o item #${id_item} do pedido #${id_need} como ${estado.toLowerCase()}`,
      destinatario: 'admin',
      payload: { id_pedido: Number(id_need), id_item: Number(id_item), estado }
    }).then(emitToAdmins)

    res.json({ success: true, estado })
  } catch (e) {
    console.error('[needs] businessResponse error:', e?.message)
    next(genericError('Erro ao atualizar resposta do negócio'))
  }
}

export const deleteNeed = async (req, res, next) => {
  const { id_need } = req.params;

  try {
    const need = await Needs.findByPk(id_need);
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
      await need.destroy({ transaction });
      await transaction.commit();
      res.status(204).json({});
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    next(genericError("Error deleting need"));
  }
};

export const createInstitutionNeed = async (req, res, next) => {
  const { nif_nipc } = req.params;
  const { estado, urgente, items } = req.body;

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  // Verify user is the institution owner or admin
  if (req.user.nif_nipc !== nif_nipc && req.user.role !== 'admin') {
    return next(forbiddenError('You do not have permission to create needs for this institution'));
  }

  try {
    const transaction = await Needs.sequelize.transaction();
    try {
      await ensureGoodsServicesForItems(items, transaction);

      const needData = { nif_nipc };
      if (estado !== undefined) needData.estado = estado;
      if (urgente !== undefined) needData.urgente = urgente;
      
      const need = await Needs.create(needData, { transaction });
      const createdItems = await NeedItem.bulkCreate(buildNeedItems(items, need.id_pedido), {
        transaction,
      });
      await transaction.commit();

      persistNotification({
        tipo: 'pedido_criado',
        titulo: 'Novo Pedido de Instituição',
        corpo: `Instituição ${nif_nipc} criou um novo pedido`,
        destinatario: 'admin',
        payload: { id_pedido: need.id_pedido, nif_nipc }
      }).then(emitToAdmins);

      res.status(201).json({ need, items: createdItems });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else if (e.status === 422 && e.errors) {
      // ValidationError from ensureGoodsServicesForItems — propagate as 422
      next(e);
    } else {
      console.error("[institutions/needs] create error:", e?.message, e?.original?.sqlMessage ?? '', e?.errors ?? '');
      next(genericError("Error creating institution need"));
    }
  }
};

export const getInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  try {
    const need = await Needs.findOne({
      where: { id_pedido: id_need, nif_nipc },
      include: [NeedItem],
    });
    if (!need) return next(notFoundError("Need", id_need));
    res.json({ need });
  } catch (e) {
    next(genericError("Error fetching institution need"));
  }
};

export const getAllInstitutionNeeds = async (req, res, next) => {
  const { nif_nipc } = req.params;

  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  const { limit, offset } = parsePagination(req.query);
  try {
    const { count: total, rows } = await Needs.findAndCountAll({
      where: { nif_nipc }, include: [NeedItem], limit, offset, distinct: true
    });
    res.json({ items: rows.map(r => r.toJSON()), total, limit, offset, links: buildPageLinks(`/institutions/${nif_nipc}/needs`, limit, offset, total) });
  } catch (e) {
    next(genericError("Error fetching institution needs"));
  }
};

export const updateInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;
  const { estado, items } = req.body;
  const updateData = {};
  
  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }
  
  if (estado !== undefined) updateData.estado = estado;

  try {
    const need = await Needs.findOne({ where: { id_pedido: id_need, nif_nipc } });
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      if (Object.keys(updateData).length) {
        await need.update(updateData, { transaction });
      }

      let updatedItems = [];
      if (items !== undefined) {
        await ensureGoodsServicesForItems(items, transaction);
        await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
        updatedItems = await NeedItem.bulkCreate(buildNeedItems(items, id_need), {
          transaction,
        });
      }

      await transaction.commit();
      res.json({ need, items: updatedItems.length ? updatedItems : undefined });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    if (e.name === "SequelizeValidationError") {
      next(sequelizeValidationError(e.errors));
    } else {
      next(genericError("Error updating institution need"));
    }
  }
};

export const deleteInstitutionNeed = async (req, res, next) => {
  const { nif_nipc, id_need } = req.params;

  // Validate nif_nipc format
  if (!/^\d{9}$/.test(nif_nipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  try {
    const need = await Needs.findOne({ where: { id_pedido: id_need, nif_nipc } });
    if (!need) return next(notFoundError("Need", id_need));

    const transaction = await Needs.sequelize.transaction();
    try {
      await NeedItem.destroy({ where: { id_pedido: id_need }, transaction });
      await need.destroy({ transaction });
      await transaction.commit();
      res.status(204).json({});
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (e) {
    next(genericError("Error deleting institution need"));
  }
};