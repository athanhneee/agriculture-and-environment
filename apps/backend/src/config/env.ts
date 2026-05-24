import dotenv from 'dotenv';

dotenv.config();


export const env = {
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
