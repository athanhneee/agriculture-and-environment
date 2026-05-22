import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { JwtUtil } from '../utils/jwt';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    farmZone: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('FarmZone API Tests', () => {
  let token: string;

  beforeAll(() => {
    token = JwtUtil.generateAccessToken({
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/farm-zones', () => {
    it('should fail validation when required fields are missing or invalid type', async () => {
      const res = await request(app)
        .post('/api/farm-zones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Farm 1',
          // missing area, latitude, longitude, soilType
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation Error');
    });
  });
});
