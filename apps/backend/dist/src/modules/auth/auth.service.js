"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const client_1 = require("@prisma/client");
class AuthService {
    // Hàm băm token để lưu DB
    static hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    static async register(data) {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw { statusCode: 409, message: 'Email này đã được đăng ký' };
        }
        const passwordHash = await password_1.PasswordUtil.hash(data.password);
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: client_1.Role.USER, // Mặc định là USER
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true } // Không trả về passwordHash
        });
        return user;
    }
    static async login(email, password) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw { statusCode: 401, message: 'Email hoặc mật khẩu không chính xác' };
        const isValidPassword = await password_1.PasswordUtil.verify(password, user.passwordHash);
        if (!isValidPassword)
            throw { statusCode: 401, message: 'Email hoặc mật khẩu không chính xác' };
        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = jwt_1.JwtUtil.generateAccessToken(payload);
        const refreshToken = jwt_1.JwtUtil.generateRefreshToken(payload);
        // Lưu Refresh Token đã băm vào DB
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
            }
        });
        const { passwordHash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken, refreshToken };
    }
    static async refresh(token) {
        const decoded = jwt_1.JwtUtil.verifyRefreshToken(token);
        const tokenHash = this.hashToken(token);
        const storedToken = await prisma_1.default.refreshToken.findUnique({ where: { tokenHash } });
        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            throw { statusCode: 401, message: 'Refresh token không hợp lệ hoặc đã bị thu hồi' };
        }
        // Xoay vòng Token: Thu hồi token cũ, cấp token mới
        await prisma_1.default.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() }
        });
        const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
        const newAccessToken = jwt_1.JwtUtil.generateAccessToken(payload);
        const newRefreshToken = jwt_1.JwtUtil.generateRefreshToken(payload);
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: this.hashToken(newRefreshToken),
                userId: decoded.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });
        return { newAccessToken, newRefreshToken };
    }
    static async logout(token) {
        const tokenHash = this.hashToken(token);
        await prisma_1.default.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() }
        });
    }
    static async getMe(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        if (!user)
            throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
        return user;
    }
}
exports.AuthService = AuthService;
