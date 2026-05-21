"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class JwtUtil {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.jwtAccessSecret, { expiresIn: '15m' }); // Access token sống 15 phút
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.jwtRefreshSecret, { expiresIn: '7d' }); // Refresh token sống 7 ngày
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
    }
}
exports.JwtUtil = JwtUtil;
