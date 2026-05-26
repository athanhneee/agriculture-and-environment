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

function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1] || null;
  }

  // Fallback cho các luồng frontend dùng cookie:
  // - Next middleware kiểm tra cookie accessToken
  // - Server Action đọc cookie accessToken
  // - window.open export Excel không tự gắn Authorization header
  const cookieToken = req.cookies?.accessToken;

  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    return cookieToken;
  }

  return null;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getAccessToken(req);

    if (!token) {
      return res.status(401).json(ApiResponse.error('Không tìm thấy Access Token'));
    }

    const decoded = JwtUtil.verifyAccessToken(token);
    req.user = decoded;

    return next();
  } catch {
    return res
      .status(401)
      .json(ApiResponse.error('Access Token không hợp lệ hoặc đã hết hạn'));
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Chưa xác thực người dùng'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(ApiResponse.error('Bạn không có quyền truy cập tài nguyên này (Forbidden)'));
    }

    return next();
  };
};