import prisma from '../../config/prisma';
import crypto from 'crypto';
import { PasswordUtil } from '../../utils/password';
import { JwtUtil, JwtPayload } from '../../utils/jwt';
import { Role } from '@prisma/client';
import { sendOtpEmail } from '../../utils/email';

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

    if (user.status === 'INACTIVE') {
      throw { statusCode: 403, message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' };
    }

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
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
    return user;
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };

    const isValidPassword = await PasswordUtil.verify(oldPassword, user.passwordHash);
    if (!isValidPassword) throw { statusCode: 401, message: 'Mật khẩu hiện tại không chính xác' };

    const newPasswordHash = await PasswordUtil.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Optional: Có thể thêm logic thu hồi tất cả Refresh Token để bắt người dùng đăng nhập lại
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Bảo mật: Không thông báo là email không tồn tại
      return;
    }

    // Tạo mã OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Thu hồi các OTP cũ
    await prisma.passwordResetOtp.deleteMany({
      where: { email }
    });

    // Lưu OTP mới
    await prisma.passwordResetOtp.create({
      data: {
        email,
        otp,
        expiresAt
      }
    });

    // Gửi email
    await sendOtpEmail(email, otp);
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };

    const resetRecord = await prisma.passwordResetOtp.findFirst({
      where: { email, otp, used: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRecord) {
      throw { statusCode: 400, message: 'Mã OTP không chính xác' };
    }

    if (resetRecord.expiresAt < new Date()) {
      throw { statusCode: 400, message: 'Mã OTP đã hết hạn' };
    }

    const newPasswordHash = await PasswordUtil.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash: newPasswordHash }
      }),
      prisma.passwordResetOtp.update({
        where: { id: resetRecord.id },
        data: { used: true }
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);
  }
}