"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.AuthValidation = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../../utils/apiResponse");
exports.AuthValidation = {
    register: zod_1.z.object({
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
            email: zod_1.z.string().email('Email không hợp lệ'),
            password: zod_1.z.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số'),
            confirmPassword: zod_1.z.string()
        }).refine((data) => data.password === data.confirmPassword, {
            message: 'Mật khẩu xác nhận không khớp',
            path: ['confirmPassword'],
        })
    }),
    login: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z.string().email('Email không hợp lệ'),
            password: zod_1.z.string().min(1, 'Vui lòng nhập mật khẩu'),
        })
    })
};
// Middleware bọc Zod để validate request
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
