"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSensorSchema = exports.createSensorSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createSensorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên cảm biến không được để trống'),
    code: zod_1.z.string().min(1, 'Mã cảm biến không được để trống'),
    type: zod_1.z.nativeEnum(client_1.SensorType),
    unit: zod_1.z.string().min(1, 'Đơn vị đo không được để trống'),
    status: zod_1.z.nativeEnum(client_1.SensorStatus).optional(),
    farmZoneId: zod_1.z.string().uuid('ID vùng canh tác không hợp lệ')
});
exports.updateSensorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên cảm biến không được để trống').optional(),
    code: zod_1.z.string().min(1, 'Mã cảm biến không được để trống').optional(),
    type: zod_1.z.nativeEnum(client_1.SensorType).optional(),
    unit: zod_1.z.string().min(1, 'Đơn vị đo không được để trống').optional(),
    status: zod_1.z.nativeEnum(client_1.SensorStatus).optional(),
    farmZoneId: zod_1.z.string().uuid('ID vùng canh tác không hợp lệ').optional()
});
