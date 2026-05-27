import prisma from '../../config/prisma';
import crypto from 'crypto';
import { PasswordUtil } from '../../utils/password';
import { JwtUtil, JwtPayload } from '../../utils/jwt';
import { Role } from '@prisma/client';

export class AuthService {
  // Hàm băm token để lưu DB
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async register(data: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw { statusCode: 409, message: 'Email này đã được đăng ký' };
    }

    const passwordHash = await PasswordUtil.hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: Role.USER, // Mặc định là USER
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true } // Không trả về passwordHash
    });

    return user;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { statusCode: 401, message: 'Email hoặc mật khẩu không chính xác' };

    const isValidPassword = await PasswordUtil.verify(password, user.passwordHash);
    if (!isValidPassword) throw { statusCode: 401, message: 'Email hoặc mật khẩu không chính xác' };

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // Lưu Refresh Token đã băm vào DB
    await prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  static async refresh(token: string) {
    const decoded = JwtUtil.verifyRefreshToken(token);
    const tokenHash = this.hashToken(token);

    const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Refresh token không hợp lệ hoặc đã bị thu hồi' };
    }

    // Xoay vòng Token: Thu hồi token cũ, cấp token mới
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    const payload: JwtPayload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = JwtUtil.generateAccessToken(payload);
    const newRefreshToken = JwtUtil.generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(newRefreshToken),
        userId: decoded.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    return { newAccessToken, newRefreshToken };
  }

  static async logout(token: string) {
    const tokenHash = this.hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
    return user;
  }
}