import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { corsOptions } from './config/cors';
import { errorHandler } from './middlewares/error.middleware';
import { ApiResponse } from './utils/apiResponse';
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// --- 1. Global Middlewares ---
app.use(helmet()); // Bảo mật HTTP headers
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
app.use('/api/auth', authRoutes);
// --- 3. Error Handling Middleware (luôn để cuối cùng) ---
app.use(errorHandler);

export default app;