import { en } from 'zod/locales';
import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const startServer = async () => {
  try {
    // Kiểm tra kết nối tới Database trước khi start server
    await prisma.$connect();
    console.log('📦 Database connected successfully');

    
    app.listen(env.port, () => {
      console.log(`🚀 Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();