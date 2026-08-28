// lib/socket.ts - Socket.io Setup
import { Server as SocketIOServer } from 'socket.io';
import { type NextRequest } from 'next/server';
import { type Server as HttpServer } from 'http';

type IncomingMessage = any;
type ServerResponse = any;

let io: SocketIOServer | null = null;

export function getSocketIO(app: HttpServer<IncomingMessage, ServerResponse>): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(app, {
      cors: {
        origin: process.env.SOCKETIO_CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    setupSocketEvents(io);
  }

  return io;
}

function setupSocketEvents(io: SocketIOServer) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const { verifyToken } = await import('./auth');
    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    next();
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Broadcast online status
    io.to(`user:${userId}`).emit('status:connected', { userId });

    // Handle typing events
    socket.on('typing:start', ({ chatId }) => {
      socket.to(chatId).emit('typing:update', {
        chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(chatId).emit('typing:update', {
        chatId,
        userId,
        isTyping: false,
      });
    });

    // Handle status updates
    socket.on('status:update', async (status) => {
      const { prisma } = await import('./prisma');
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: status.status,
          customStatus: status.customStatus,
          isOnline: status.status === 'ONLINE',
          lastActive: new Date(),
        },
      });

      io.to(`user:${userId}`).emit('status:updated', {
        userId,
        ...status,
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      const { prisma } = await import('./prisma');
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      });
    });
  });
}

export function setupSocketAPI(app: HttpServer<IncomingMessage, ServerResponse>) {
  const io = getSocketIO(app);

  return {
    io,
    emitToUser: (userId: string, event: string, data: any) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    emitToChat: (chatId: string, event: string, data: any) => {
      io.to(chatId).emit(event, data);
    },
    emitToRoom: (room: string, event: string, data: any) => {
      io.to(room).emit(event, data);
    },
  };
}

export function getIO(): SocketIOServer | null {
  return io;
}
