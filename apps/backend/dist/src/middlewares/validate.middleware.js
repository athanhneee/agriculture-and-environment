"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi kiểm tra dữ liệu đầu vào (Validation Error)', error.errors));
        }
    };
};
exports.validate = validate;
