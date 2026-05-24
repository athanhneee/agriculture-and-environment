"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const apiResponse_1 = require("../../utils/apiResponse");
const env_1 = require("../../config/env");
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: env_1.env.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
};
class AuthController {
    static async register(req, res) {
        const user = await auth_service_1.AuthService.register(req.body);
        res.status(201).json(apiResponse_1.ApiResponse.success('Đăng ký tài khoản thành công', user));
    }
    static async login(req, res) {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await auth_service_1.AuthService.login(email, password);
        setRefreshCookie(res, refreshToken);
        res.status(200).json(apiResponse_1.ApiResponse.success('Đăng nhập thành công', { user, accessToken }));
    }
    static async refresh(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json(apiResponse_1.ApiResponse.error('Không tìm thấy Refresh Token trong cookie'));
        }
        const { newAccessToken, newRefreshToken } = await auth_service_1.AuthService.refresh(refreshToken);
        setRefreshCookie(res, newRefreshToken);
        res.status(200).json(apiResponse_1.ApiResponse.success('Làm mới token thành công', { accessToken: newAccessToken }));
    }
    static async logout(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await auth_service_1.AuthService.logout(refreshToken);
            res.clearCookie('refreshToken');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success('Đăng xuất thành công'));
    }
    static async getMe(req, res) {
        const userId = req.user.id;
        const user = await auth_service_1.AuthService.getMe(userId);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thông tin thành công', user));
    }
}
exports.AuthController = AuthController;
