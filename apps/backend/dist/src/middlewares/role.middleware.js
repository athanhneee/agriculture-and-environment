"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(apiResponse_1.ApiResponse.error('Chưa xác thực người dùng'));
        }
        if (req.user.role !== role) {
            return res.status(403).json(apiResponse_1.ApiResponse.error('Bạn không có quyền truy cập tài nguyên này (Forbidden)'));
        }
        next();
    };
};
exports.requireRole = requireRole;
