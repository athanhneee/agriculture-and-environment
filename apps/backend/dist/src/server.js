"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const socket_1 = require("./sockets/socket");
const sensorMock_job_1 = require("./jobs/sensorMock.job");
const startServer = async () => {
    try {
        // Kiểm tra kết nối tới Database trước khi start server
        await prisma_1.default.$connect();
        console.log('📦 Database connected successfully');
        const server = http_1.default.createServer(app_1.default);
        (0, socket_1.initSocket)(server);
        server.listen(env_1.env.port, () => {
            console.log(`🚀 Server is running on port ${env_1.env.port} in ${env_1.env.nodeEnv} mode`);
            (0, sensorMock_job_1.startSensorMockJob)();
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to the database', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
};
startServer();
