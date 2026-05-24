"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';
    // Chỉ in ra stack trace nếu đang ở môi trường dev để bảo mật
    const errors = env_1.env.isDev ? err.stack : undefined;
    res.status(statusCode).json(apiResponse_1.ApiResponse.error(message, errors));
};
exports.errorHandler = errorHandler;
