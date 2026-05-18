import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';

  // Chỉ in ra stack trace nếu đang ở môi trường dev để bảo mật
  const errors = env.isDev ? err.stack : undefined;

  res.status(statusCode).json(ApiResponse.error(message, errors));
};