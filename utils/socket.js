import { Server } from 'socket.io';
import { verifyToken, hashApiToken } from './auth.utils.js';
import { Notifications, LockersTelemetry } from '../models/db.config.js';

let io = null;

export function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Panels connect without a token and are assigned the 'panel' role.
  // All other clients authenticate via JWT or a permanent API token (sam_*).
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.role = 'panel';
      return next();
    }

    if (token.startsWith('sam_')) {
      try {
        const { ApiTokens } = await import('../models/db.config.js');
        const hash = hashApiToken(token);
        const apiToken = await ApiTokens.findOne({ token_hash: hash, revoked: false });
        if (!apiToken) return next(new Error('auth_error'));

        socket.role = apiToken.role;
        socket.nif = apiToken.nif_nipc;
        return next();
      } catch (e) {
        return next(new Error('auth_error'));
      }
    }

    try {
      socket.user = verifyToken(token);
      socket.role = socket.user.role;
      socket.nif = socket.user.nif_nipc;
    } catch {
      return next(new Error('auth_error'));
    }
    next();
  });

  // Room layout: room:admin (admins), room:user:{nif} (per-entity), room:panel (kiosks)
  io.on('connection', (socket) => {
    if (socket.role === 'admin') {
      socket.join('room:admin');
      console.log(`[ws] admin connected: ${socket.nif}`);
    }

    if (socket.nif) {
      socket.join(`room:user:${socket.nif}`);
    } else if (socket.role === 'panel') {
      socket.join('room:panel');
    }

    socket.on('telemetry:send', async (data, ack) => {
      try {
        const record = await LockersTelemetry.create({
          ...data,
          timestamp: data.timestamp ?? new Date(),
        });

        io.to('room:admin').emit('telemetry:update', record.toObject());

        if (data.aviso) {
          const notif = await upsertTelemetryNotification({ aviso: data.aviso, locker_id: data.locker_id });
          io.to('room:admin').emit('notification:new', notif);
        }

        if (typeof ack === 'function') ack({ ok: true });
      } catch (e) {
        console.error('[ws] telemetry:send error:', e);
        if (typeof ack === 'function') ack({ ok: false });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[ws] disconnected: ${socket.id} (${socket.role ?? 'unknown'})`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/** Persist a notification to MongoDB. Called by controllers after mutations. */
export async function persistNotification({ tipo, titulo, corpo, destinatario, payload = {} }) {
  try {
    const doc = await Notifications.create({
      tipo,
      titulo,
      corpo,
      destinatario,
      data_envio: new Date(),
      estado_envio: 'enviada',
      lida: false,
      payload,
    });
    return doc.toObject();
  } catch (e) {
    console.error('[ws] persistNotification error:', e);
    return null;
  }
}

// A single telemetry-alert notification is upserted instead of creating one per alert.
// It accumulates up to 50 recent alerts in payload.alerts[] and is marked unread
// on each update so it surfaces in the admin notification feed.
export async function upsertTelemetryNotification({ aviso, locker_id }) {
  try {
    const existing = await Notifications.findOne({ tipo: 'telemetria_alerta', destinatario: 'admin' });
    const prevAlerts = existing?.payload?.alerts ?? [];
    const alerts = [
      ...prevAlerts.slice(-49),
      { aviso, locker_id, timestamp: new Date().toISOString() }
    ];
    const count = alerts.length;
    const doc = await Notifications.findOneAndUpdate(
      { tipo: 'telemetria_alerta', destinatario: 'admin' },
      {
        $set: {
          titulo: `Alertas de Telemetria (${count})`,
          corpo: `Último: ${aviso}`,
          data_envio: new Date(),
          estado_envio: 'enviada',
          lida: false,
          payload: { alerts }
        }
      },
      { upsert: true, new: true }
    );
    return doc.toObject();
  } catch (e) {
    console.error('[ws] upsertTelemetryNotification error:', e);
    return null;
  }
}

export function emitToAdmins(notif) {
  if (!io || !notif) return;
  io.to('room:admin').emit('notification:new', notif);
}

export function emitToUser(nif, notif) {
  if (!io || !notif) return;
  io.to(`room:user:${nif}`).emit('notification:new', notif);
}

export function emitTelemetryUpdate(record) {
  if (!io) return;
  io.to('room:admin').emit('telemetry:update', record);
}
