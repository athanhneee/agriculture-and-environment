import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import prisma from '../config/prisma';
import { JwtPayload, JwtUtil } from '../utils/jwt';

let io: Server;

const FARM_ZONE_ROOM_PREFIX = 'farm-zone:';
const USER_ROOM_PREFIX = 'user:';

export const SOCKET_ROOMS = {
  admins: 'admins',
  user: (userId: string) => `${USER_ROOM_PREFIX}${userId}`,
  farmZone: (farmZoneId: string) => `${FARM_ZONE_ROOM_PREFIX}${farmZoneId}`,
};

type AuthenticatedSocket = Socket & {
  user: JwtPayload;
};

type RoomAck = {
  ok: boolean;
  roomId?: string;
  message?: string;
};

type RoomAckCallback = (response: RoomAck) => void;

function getHandshakeToken(socket: Socket): string | null {
  const token = socket.handshake.auth?.token;

  if (typeof token === 'string' && token.trim()) {
    return token.trim();
  }

  return null;
}

async function authenticateSocket(socket: Socket): Promise<JwtPayload> {
  const token = getHandshakeToken(socket);

  if (!token) {
    throw new Error('Missing socket token');
  }

  const decoded = JwtUtil.verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new Error('Socket user is inactive or missing');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    jti: decoded.jti,
  };
}

function parseFarmZoneRoom(roomId: string): string | null {
  if (!roomId.startsWith(FARM_ZONE_ROOM_PREFIX)) {
    return null;
  }

  const farmZoneId = roomId.slice(FARM_ZONE_ROOM_PREFIX.length).trim();
  return farmZoneId || null;
}

function parseUserRoom(roomId: string): string | null {
  if (!roomId.startsWith(USER_ROOM_PREFIX)) {
    return null;
  }

  const userId = roomId.slice(USER_ROOM_PREFIX.length).trim();
  return userId || null;
}

export async function canJoinSocketRoom(user: JwtPayload, roomId: string): Promise<boolean> {
  const normalizedRoomId = roomId.trim();

  if (!normalizedRoomId) {
    return false;
  }

  const userRoomId = parseUserRoom(normalizedRoomId);
  const farmZoneId = parseFarmZoneRoom(normalizedRoomId);

  if (user.role === 'ADMIN') {
    if (normalizedRoomId === SOCKET_ROOMS.admins) {
      return true;
    }

    if (userRoomId) {
      return true;
    }

    if (farmZoneId) {
      const farmZone = await prisma.farmZone.findUnique({
        where: { id: farmZoneId },
        select: { id: true },
      });

      return Boolean(farmZone);
    }

    return false;
  }

  if (userRoomId) {
    return userRoomId === user.id;
  }

  if (!farmZoneId) {
    return false;
  }

  const farmZone = await prisma.farmZone.findUnique({
    where: { id: farmZoneId },
    select: { ownerId: true },
  });

  return farmZone?.ownerId === user.id;
}

export function emitFarmZoneScopedEvent(
  farmZoneId: string,
  ownerId: string,
  event: string,
  payload: unknown,
) {
  getIO()
    .to(SOCKET_ROOMS.user(ownerId))
    .to(SOCKET_ROOMS.farmZone(farmZoneId))
    .to(SOCKET_ROOMS.admins)
    .emit(event, payload);
}

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket: Socket, next) => {
    authenticateSocket(socket)
      .then((user) => {
        (socket as AuthenticatedSocket).user = user;
        socket.data.user = user;
        next();
      })
      .catch(() => {
        next(new Error('Socket authentication failed'));
      });
  });

  io.on('connection', (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const { user } = authenticatedSocket;

    socket.join(SOCKET_ROOMS.user(user.id));

    if (user.role === 'ADMIN') {
      socket.join(SOCKET_ROOMS.admins);
    }

    console.log(` New authenticated client connected: ${socket.id} (${user.id})`);

    socket.on('join-room', async (roomId: string, callback?: RoomAckCallback) => {
      const normalizedRoomId = typeof roomId === 'string' ? roomId.trim() : '';

      try {
        const allowed = await canJoinSocketRoom(user, normalizedRoomId);

        if (!allowed) {
          const response = {
            ok: false,
            roomId: normalizedRoomId,
            message: 'Not allowed to join this room',
          };

          callback?.(response);
          socket.emit('room:error', response);
          return;
        }

        socket.join(normalizedRoomId);
        callback?.({ ok: true, roomId: normalizedRoomId });
        socket.emit('room:joined', { roomId: normalizedRoomId });
        console.log(` Socket ${socket.id} joined room: ${normalizedRoomId}`);
      } catch {
        const response = {
          ok: false,
          roomId: normalizedRoomId,
          message: 'Could not join this room',
        };

        callback?.(response);
        socket.emit('room:error', response);
      }
    });

    socket.on('leave-room', (roomId: string) => {
      const normalizedRoomId = typeof roomId === 'string' ? roomId.trim() : '';

      if (!normalizedRoomId || normalizedRoomId === SOCKET_ROOMS.user(user.id)) {
        return;
      }

      socket.leave(normalizedRoomId);
      console.log(` Socket ${socket.id} left room: ${normalizedRoomId}`);
    });

    socket.on('disconnect', () => {
      console.log(` Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
