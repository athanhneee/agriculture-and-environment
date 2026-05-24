"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCropSchema = exports.createCropSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCropSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên cây trồng không được để trống'),
    variety: zod_1.z.string().min(1, 'Giống cây trồng không được để trống'),
    plantedDate: zod_1.z.string().datetime('Ngày trồng phải đúng định dạng ISO 8601'),
    expectedHarvestDate: zod_1.z.string().datetime('Ngày thu hoạch dự kiến phải đúng định dạng ISO 8601').optional(),
    status: zod_1.z.nativeEnum(client_1.CropStatus).optional(),
    farmZoneId: zod_1.z.string().uuid('ID vùng canh tác không hợp lệ')
}).refine((data) => {
    if (data.expectedHarvestDate) {
        const planted = new Date(data.plantedDate);
        const harvest = new Date(data.expectedHarvestDate);
        return harvest > planted;
    }
    return true;
}, {
    message: 'Ngày thu hoạch dự kiến phải lớn hơn ngày trồng',
    path: ['expectedHarvestDate']
});
exports.updateCropSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên cây trồng không được để trống').optional(),
    variety: zod_1.z.string().min(1, 'Giống cây trồng không được để trống').optional(),
    plantedDate: zod_1.z.string().datetime('Ngày trồng phải đúng định dạng ISO 8601').optional(),
    expectedHarvestDate: zod_1.z.string().datetime('Ngày thu hoạch dự kiến phải đúng định dạng ISO 8601').optional(),
    status: zod_1.z.nativeEnum(client_1.CropStatus).optional(),
    farmZoneId: zod_1.z.string().uuid('ID vùng canh tác không hợp lệ').optional()
}).refine((data) => {
    if (data.plantedDate && data.expectedHarvestDate) {
        const planted = new Date(data.plantedDate);
        const harvest = new Date(data.expectedHarvestDate);
        return harvest > planted;
    }
    return true;
}, {
    message: 'Ngày thu hoạch dự kiến phải lớn hơn ngày trồng',
    path: ['expectedHarvestDate']
});
