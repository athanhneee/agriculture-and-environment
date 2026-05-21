"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const startServer = async () => {
    try {
        // Kiểm tra kết nối tới Database trước khi start server
        await prisma_1.default.$connect();
        console.log('📦 Database connected successfully');
        app_1.default.listen(env_1.env.port, () => {
            console.log(`🚀 Server is running on port ${env_1.env.port} in ${env_1.env.nodeEnv} mode`);
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to the database', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
};
startServer();
