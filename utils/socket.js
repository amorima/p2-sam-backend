import { Server } from 'socket.io';
import { verifyToken } from './auth.utils.js';
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

  // Authenticate socket connections via JWT; panels connect without token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.role = 'panel';
      return next();
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

  io.on('connection', (socket) => {
    if (socket.role === 'admin') {
      socket.join('room:admin');
      console.log(`[ws] admin connected: ${socket.nif}`);
    } else if (socket.nif) {
      socket.join(`room:user:${socket.nif}`);
      console.log(`[ws] user connected: ${socket.nif} (${socket.role})`);
    } else {
      socket.join('room:panel');
      console.log(`[ws] panel connected: ${socket.id}`);
    }

    // Panel sends telemetry via WS (replaces/supplements HTTP polling)
    socket.on('telemetry:send', async (data, ack) => {
      try {
        const record = await LockersTelemetry.create({
          ...data,
          timestamp: data.timestamp ?? new Date(),
        });

        io.to('room:admin').emit('telemetry:update', record.toObject());

        if (data.aviso) {
          const notif = await persistNotification({
            tipo: 'telemetria_alerta',
            titulo: 'Alerta de Telemetria',
            corpo: `Painel reportou: ${data.aviso}`,
            destinatario: 'admin',
            payload: { locker_id: data.locker_id, aviso: data.aviso }
          });
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

/**
 * Persist a notification to MongoDB and return the plain object.
 * Called by controllers after mutations so history is always saved.
 */
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

/** Emit a notification to all admin sockets. */
export function emitToAdmins(notif) {
  if (!io || !notif) return;
  io.to('room:admin').emit('notification:new', notif);
}

/** Emit a notification to a specific user (by nif_nipc). */
export function emitToUser(nif, notif) {
  if (!io || !notif) return;
  io.to(`room:user:${nif}`).emit('notification:new', notif);
}

/** Push a telemetry frame to the admin room (for HTTP-path telemetry). */
export function emitTelemetryUpdate(record) {
  if (!io) return;
  io.to('room:admin').emit('telemetry:update', record);
}
