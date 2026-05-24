"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const env_1 = require("./env");
// 1. Tạo một Connection Pool truyền thống bằng driver 'pg' 
// Lấy chuỗi kết nối từ biến DATABASE_URL trong file .env
const pool = new pg_1.Pool({ connectionString: env_1.env.databaseUrl });
// 2. Khởi tạo Prisma Driver Adapter bọc quanh pool vừa tạo
const adapter = new adapter_pg_1.PrismaPg(pool);
// 3. Hàm khởi tạo Singleton truyền Adapter vào trong PrismaClient
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        adapter, // <-- Đây chính là "vũ khí" giúp engineType "client" hoạt động được!
        log: env_1.env.isDev
            ? [
                { emit: 'stdout', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'warn' },
            ]
            : [{ emit: 'stdout', level: 'error' }],
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
if (env_1.env.isDev) {
    globalThis.prismaGlobal = prisma;
}
