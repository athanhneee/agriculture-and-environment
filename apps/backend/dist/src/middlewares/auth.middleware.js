"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json(apiResponse_1.ApiResponse.error('Không tìm thấy Access Token'));
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt_1.JwtUtil.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json(apiResponse_1.ApiResponse.error('Access Token không hợp lệ hoặc đã hết hạn'));
    }
};
exports.authenticate = authenticate;
