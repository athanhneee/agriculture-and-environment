import { Request, Response, NextFunction } from 'express';
import { JwtUtil, JwtPayload } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error('Không tìm thấy Access Token'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtil.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.error('Access Token không hợp lệ hoặc đã hết hạn'));
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Chưa xác thực người dùng'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.error('Bạn không có quyền truy cập tài nguyên này (Forbidden)'));
    }

    next();
  };
};