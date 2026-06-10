import http from 'http';
import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import { initSocket } from './sockets/socket';
import { startSensorMockJob } from './jobs/sensorMock.job';
import { startPartitionMaintenanceJob } from './jobs/partitionMaintenance.job';

const startServer = async () => {
  try {
    // Kiểm tra kết nối tới Database trước khi start server
    await prisma.$connect();
    console.log('📦 Database connected successfully');

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, env.host, () => {
      console.log(`🚀 Server is running on port ${env.port} in ${env.nodeEnv} mode`);
      startSensorMockJob();
      startPartitionMaintenanceJob();
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
