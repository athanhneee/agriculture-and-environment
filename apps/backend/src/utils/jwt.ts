import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export class JwtUtil {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: '15m' }); // Access token sống 15 phút
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' }); // Refresh token sống 7 ngày
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
  }
}