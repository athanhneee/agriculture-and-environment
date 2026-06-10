import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from './env';

// 1. Tạo một Connection Pool truyền thống bằng driver 'pg' 
// Lấy chuỗi kết nối từ biến DATABASE_URL trong file .env
const pool = new Pool({ connectionString: env.databaseUrl });

// 2. Khởi tạo Prisma Driver Adapter bọc quanh pool vừa tạo
const adapter = new PrismaPg(pool);

// 3. Hàm khởi tạo Singleton truyền Adapter vào trong PrismaClient
const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    adapter, // <-- Đây chính là "vũ khí" giúp engineType "client" hoạt động được!
    log: [
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });
};

// 4. Đăng ký vào Global scope để tránh rò rỉ kết nối khi hot-reload (Môi trường Dev)
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (env.isDev) {
  globalThis.prismaGlobal = prisma;
}