"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    databaseUrl: process.env.DATABASE_URL,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    isDev: process.env.NODE_ENV === 'development',
    sensorMockEnabled: process.env.SENSOR_MOCK_ENABLED === 'true',
    sensorMockIntervalMs: parseInt(process.env.SENSOR_MOCK_INTERVAL_MS || '5000', 10),
};
