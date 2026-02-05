import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

let io: Server | null = null;

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

/**
 * Attach Socket.IO to the HTTP server. Clients must send an auth token
 * (e.g. in handshake.auth.token). Valid JWT assigns the socket to room `user:${userId}`.
 */
export function initSocket(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : process.env.NODE_ENV === 'production'
          ? false
          : '*',
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers?.authorization?.replace('Bearer ', '') as string);

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyAccessToken(token);
      (socket as Socket & { userId: string }).userId = payload.sub;
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    const room = `user:${userId}`;
    socket.join(room);
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  return io;
}

/**
 * Emit a new notification to a user's room. Call this after creating a notification in the DB
 * (e.g. order placed, order cancelled, payment success).
 */
export function emitNotification(userId: string, notification: NotificationPayload): void {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification', notification);
}
