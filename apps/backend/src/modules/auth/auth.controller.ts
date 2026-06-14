import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';
import { env } from '../../config/env';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
};

export class AuthController {
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(req.body);
    res.status(201).json(ApiResponse.success('Đăng ký tài khoản thành công', user));
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);
    
    setRefreshCookie(res, refreshToken);
    res.status(200).json(ApiResponse.success('Đăng nhập thành công', { user, accessToken }));
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(ApiResponse.error('Không tìm thấy Refresh Token trong cookie'));
    }

    const { newAccessToken, newRefreshToken } = await AuthService.refresh(refreshToken);
    setRefreshCookie(res, newRefreshToken);
    
    res.status(200).json(ApiResponse.success('Làm mới token thành công', { accessToken: newAccessToken }));
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'none' : 'strict',
      });
    }
    res.status(200).json(ApiResponse.success('Đăng xuất thành công'));
  }

  static async getMe(req: Request, res: Response) {
    const userId = req.user!.id;
    const user = await AuthService.getMe(userId);
    res.status(200).json(ApiResponse.success('Lấy thông tin thành công', user));
  }

  static async changePassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    await AuthService.changePassword(userId, oldPassword, newPassword);
    res.status(200).json(ApiResponse.success('Đổi mật khẩu thành công'));
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    // Luôn trả về thành công dù email có tồn tại hay không (bảo mật)
    res.status(200).json(ApiResponse.success('Nếu email hợp lệ, một mã OTP đã được gửi đến hộp thư của bạn.'));
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    res.status(200).json(ApiResponse.success('Khôi phục mật khẩu thành công. Vui lòng đăng nhập lại.'));
  }
}