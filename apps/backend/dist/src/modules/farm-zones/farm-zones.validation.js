"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFarmZoneSchema = exports.createFarmZoneSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createFarmZoneSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên vùng không được để trống'),
    description: zod_1.z.string().optional(),
    area: zod_1.z.number().positive('Diện tích phải lớn hơn 0'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    soilType: zod_1.z.string().min(1, 'Loại đất là bắt buộc'),
    status: zod_1.z.nativeEnum(client_1.ZoneStatus).optional(),
});
exports.updateFarmZoneSchema = exports.createFarmZoneSchema.partial();
