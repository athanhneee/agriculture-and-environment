import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { Role } from '@prisma/client';

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Chưa xác thực người dùng'));
    }

    if (req.user.role !== role) {
      return res.status(403).json(ApiResponse.error('Bạn không có quyền truy cập tài nguyên này (Forbidden)'));
    }

    next();
  };
};