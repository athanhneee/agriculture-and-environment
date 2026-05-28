import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  jti?: string;
}

export class JwtUtil {
  static generateAccessToken(payload: JwtPayload): string {
    const payloadWithJti = { ...payload, jti: crypto.randomUUID() };
    return jwt.sign(payloadWithJti, env.jwtAccessSecret, { expiresIn: '15m' }); // Access token sống 15 phút
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const payloadWithJti = { ...payload, jti: crypto.randomUUID() };
    return jwt.sign(payloadWithJti, env.jwtRefreshSecret, { expiresIn: '7d' }); // Refresh token sống 7 ngày
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
  }
}