import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { corsOptions } from './config/cors';
import { errorHandler } from './middlewares/error.middleware';
import { ApiResponse } from './utils/apiResponse';
import authRoutes from './modules/auth/auth.routes';
import farmZoneRoutes from './modules/farm-zones/farm-zones.routes';
import cropRoutes from './modules/crops/crops.routes';
import sensorRoutes from './modules/sensors/sensors.routes';
import sensorReadingRoutes from './modules/sensor-readings/sensorReadings.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';
import exportsRoutes from './modules/exports/exports.routes';
import importRoutes from "./modules/imports/imports.routes";
const app: Application = express();

// --- 1. Global Middlewares ---
app.use(helmet()); // Bảo mật HTTP headers
app.use(compression()); // Nén HTTP response (Gzip/Brotli) để tải nhanh hơn
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isDev ? 'dev' : 'combined')); // Log request

// --- 2. Routes ---
// Endpoint Health Check theo yêu cầu
app.get('/api/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'Backend is running smoothly 🚀',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  };

  res.status(200).json(ApiResponse.success('Health check passed', healthData));
});

// Các Routes khác (Router - Controller - Service) sẽ được mount ở đây sau
// Ví dụ: app.use('/api/users', userRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/farm-zones', farmZoneRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/sensor-readings', sensorReadingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/exports', exportsRoutes);
app.use("/api/imports", importRoutes);

// --- 3. Error Handling Middleware (luôn để cuối cùng) ---
app.use(errorHandler);

export default app;
