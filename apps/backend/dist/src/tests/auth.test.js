"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Mock prisma
jest.mock('../config/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
describe('Auth API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        it('should fail validation when email is invalid', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Validation Error');
        });
    });
    describe('POST /api/auth/login', () => {
        it('should return token on successful login', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
            // Mock db response
            prisma_1.default.user.findUnique.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                role: 'USER',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
        });
    });
    describe('GET /api/statistics/overview', () => {
        it('should fail to access protected route without token', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/statistics/overview');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Không tìm thấy Access Token');
        });
    });
});
