process.env.DATABASE_URL ??= 'postgresql://user:password@localhost:5432/test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    farmZone: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '../config/prisma';
import { canJoinSocketRoom, SOCKET_ROOMS } from '../sockets/socket';
import type { JwtPayload } from '../utils/jwt';

describe('Socket room authorization', () => {
  const user: JwtPayload = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'USER',
  };

  const admin: JwtPayload = {
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a user to join their own user room', async () => {
    await expect(canJoinSocketRoom(user, SOCKET_ROOMS.user(user.id))).resolves.toBe(true);
  });

  it('allows a user to join a farm zone they own', async () => {
    (prisma.farmZone.findUnique as jest.Mock).mockResolvedValue({ ownerId: user.id });

    await expect(canJoinSocketRoom(user, SOCKET_ROOMS.farmZone('zone-1'))).resolves.toBe(true);
  });

  it('denies a user from joining another owner farm zone', async () => {
    (prisma.farmZone.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'other-user' });

    await expect(canJoinSocketRoom(user, SOCKET_ROOMS.farmZone('zone-2'))).resolves.toBe(false);
  });

  it('denies a non-admin from joining the admins room', async () => {
    await expect(canJoinSocketRoom(user, SOCKET_ROOMS.admins)).resolves.toBe(false);
  });

  it('allows an admin to join the admins room', async () => {
    await expect(canJoinSocketRoom(admin, SOCKET_ROOMS.admins)).resolves.toBe(true);
  });

  it('allows an admin to join any existing farm zone room', async () => {
    (prisma.farmZone.findUnique as jest.Mock).mockResolvedValue({ id: 'zone-3' });

    await expect(canJoinSocketRoom(admin, SOCKET_ROOMS.farmZone('zone-3'))).resolves.toBe(true);
  });
});
