"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const jwt_1 = require("../utils/jwt");
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
    let token;
    beforeAll(() => {
        token = jwt_1.JwtUtil.generateTokens({
            id: 'admin-1',
            email: 'admin@example.com',
            role: 'ADMIN',
        }).accessToken;
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/farm-zones', () => {
        it('should fail validation when required fields are missing or invalid type', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
