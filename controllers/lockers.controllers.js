import { Lockers, Leads, LockersTelemetry } from "../models/db.config.js";
import { genericError, notFoundError, validationError, missingFieldError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";
import { persistNotification, emitToAdmins, emitTelemetryUpdate } from "../utils/socket.js";

// ---------------------------------------------------------------------------
// In-memory door state, keyed by locker id.
//
// The physical locker (Arduino + magnet switch) pushes its door state here as
// fast pings. Keeping only the latest state in memory — instead of writing
// every ping to MongoDB — is what lets the Raspberry poll at a high rate
// without bloating the telemetry collection. A MongoDB telemetry document is
// written only on an actual ABERTA <-> FECHADA transition, so the admin
// dashboard still gets a clean event history.
// ---------------------------------------------------------------------------
const doorState = new Map();

// A locker is considered offline if no ping (state change or heartbeat) arrives
// within this window. The Arduino heartbeat interval must be well below this.
const DOOR_OFFLINE_MS = 6000;

// Normalise whatever the device sends ("OPEN"/"ABERTA"/"1"...) to a canonical
// "ABERTA" | "FECHADA". Returns null for anything unrecognised.
const normaliseDoor = (raw) => {
  const v = String(raw ?? "").trim().toUpperCase();
  if (["ABERTA", "ABERTO", "OPEN", "OPENED", "1", "TRUE", "HIGH"].includes(v)) return "ABERTA";
  if (["FECHADA", "FECHADO", "CLOSED", "CLOSE", "0", "FALSE", "LOW"].includes(v)) return "FECHADA";
  return null;
};

const snapshotFor = (idLocker) => {
  const s = doorState.get(idLocker);
  if (!s) {
    return { id_locker: idLocker, estado: "DESCONHECIDA", online: false, last_change: null, last_seen: null };
  }
  return {
    id_locker: idLocker,
    estado: s.estado,
    online: Date.now() - s.last_seen <= DOOR_OFFLINE_MS,
    last_change: new Date(s.last_change).toISOString(),
    last_seen: new Date(s.last_seen).toISOString(),
  };
};

const parseLockerId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// GET /lockers — list physical lockers (admin/internal).
export const getAllLockers = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const { count: total, rows } = await Lockers.findAndCountAll({ limit, offset, order: [["id_locker", "ASC"]] });
    res.json({
      items: rows.map((r) => ({ ...r.toJSON(), porta: snapshotFor(r.id_locker) })),
      total,
      limit,
      offset,
      links: buildPageLinks("/lockers", limit, offset, total),
    });
  } catch (e) {
    console.error("[lockers] getAll error:", e?.message);
    next(genericError("Error fetching lockers"));
  }
};

// GET /lockers/:id_locker — one locker plus its live door snapshot.
export const getLocker = async (req, res, next) => {
  const id = parseLockerId(req.params.id_locker);
  if (!id) return next(validationError([{ id_locker: "id_locker must be a positive integer" }]));
  try {
    const locker = await Lockers.findByPk(id);
    if (!locker) return next(notFoundError("Locker", id));
    res.json({ ...locker.toJSON(), porta: snapshotFor(id) });
  } catch (e) {
    console.error("[lockers] get error:", e?.message);
    next(genericError("Error fetching locker"));
  }
};

// POST /lockers/:id_locker/verify-pin  { pin }
// Resolves a delivery PIN to its pending lead WITHOUT marking it delivered.
// The Raspberry calls this when the citizen types a PIN: a match unlocks the
// "deposit the item" screen; the deposit is only confirmed later, on door close.
export const verifyPin = async (req, res, next) => {
  const id = parseLockerId(req.params.id_locker);
  if (!id) return next(validationError([{ id_locker: "id_locker must be a positive integer" }]));

  const pin = String(req.body?.pin ?? "").trim();
  if (!pin) return next(missingFieldError(["pin"]));

  try {
    // Match any pending lead by PIN. With a single physical locker we do not
    // require the lead's id_locker to match, but a most-recent ordering keeps
    // the behaviour deterministic if a PIN were ever reused.
    const lead = await Leads.findOne({
      where: { pin_entrega: pin, estado: "PENDENTE" },
      order: [["id_lead", "DESC"]],
    });

    if (!lead) {
      return res.status(404).json({ valid: false, description: "PIN inválido ou já utilizado" });
    }

    res.json({
      valid: true,
      id_lead: lead.id_lead,
      item_pedido: lead.item_pedido,
      nome_cidadao: lead.nome_cidadao,
      id_locker: id,
    });
  } catch (e) {
    console.error("[lockers] verifyPin error:", e?.message);
    next(genericError("Error verifying pin"));
  }
};

// POST /lockers/:id_locker/door  { estado: "ABERTA" | "FECHADA", ... }
// Fast door-state ping from the Arduino. Updates the in-memory snapshot on
// every call (so "online" stays true via heartbeats) and persists a telemetry
// event only when the state actually changes.
export const updateDoor = async (req, res, next) => {
  const id = parseLockerId(req.params.id_locker);
  if (!id) return next(validationError([{ id_locker: "id_locker must be a positive integer" }]));

  const estado = normaliseDoor(req.body?.estado ?? req.body?.sensor_porta ?? req.body?.door);
  if (!estado) {
    return next(validationError([{ estado: 'estado must be "ABERTA" or "FECHADA"' }]));
  }

  const now = Date.now();
  const prev = doorState.get(id);
  const changed = !prev || prev.estado !== estado;

  doorState.set(id, {
    estado,
    last_seen: now,
    last_change: changed ? now : prev.last_change,
  });

  // Persist + broadcast only on a real transition, never on heartbeats.
  if (changed) {
    const evento = estado === "ABERTA" ? "PORTA_ABERTA" : "PORTA_FECHADA";
    LockersTelemetry.create({
      evento,
      locker_id: id,
      tipo: "LOCKER",
      status: { sensor_porta: estado },
      timestamp: new Date(now),
    })
      .then((doc) => emitTelemetryUpdate(doc.toObject()))
      .catch((e) => console.error("[lockers] door telemetry error:", e?.message));
  }

  res.json(snapshotFor(id));
};

// GET /lockers/:id_locker/door — current door snapshot (Raspberry polls this).
export const getDoor = (req, res, next) => {
  const id = parseLockerId(req.params.id_locker);
  if (!id) return next(validationError([{ id_locker: "id_locker must be a positive integer" }]));
  res.json(snapshotFor(id));
};

// POST /lockers/:id_locker/confirm-deposit  { id_lead }
// Marks the lead ENTREGUE after the door has been opened and closed — i.e. the
// donation is confirmed. Idempotent: confirming an already-delivered lead is OK.
export const confirmDeposit = async (req, res, next) => {
  const id = parseLockerId(req.params.id_locker);
  if (!id) return next(validationError([{ id_locker: "id_locker must be a positive integer" }]));

  const idLead = req.body?.id_lead;
  if (idLead === undefined || idLead === null) return next(missingFieldError(["id_lead"]));

  try {
    const lead = await Leads.findByPk(idLead);
    if (!lead) return next(notFoundError("Lead", idLead));

    if (lead.estado === "ENTREGUE") {
      return res.json({ confirmed: true, already: true, lead });
    }

    await lead.update({ estado: "ENTREGUE", id_locker: id });

    persistNotification({
      tipo: "lead_entregue",
      titulo: "Bem Depositado no Cacifo",
      corpo: `"${lead.item_pedido}" depositado no cacifo ${id} (PIN validado)`,
      destinatario: "admin",
      payload: { id_lead: lead.id_lead, id_locker: id, item: lead.item_pedido },
    }).then(emitToAdmins);

    res.json({ confirmed: true, already: false, lead });
  } catch (e) {
    console.error("[lockers] confirmDeposit error:", e?.message);
    next(genericError("Error confirming deposit"));
  }
};
