import dotenv from "dotenv";

dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  isDev: process.env.NODE_ENV !== "production",
  sensorMockEnabled: process.env.SENSOR_MOCK_ENABLED === "true",
  sensorMockIntervalMs: Number(process.env.SENSOR_MOCK_INTERVAL_MS || 1800000), // 30 minutes
  host: process.env.HOST || '0.0.0.0',
  gasEmailWebhookUrl: process.env.GAS_EMAIL_WEBHOOK_URL,
};