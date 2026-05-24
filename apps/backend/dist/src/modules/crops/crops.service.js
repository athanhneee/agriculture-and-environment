"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CropService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class CropService {
    static async getCrops(query, user) {
        const { page = 1, limit = 10, farmZoneId, status } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (farmZoneId) {
            where.farmZoneId = String(farmZoneId);
        }
        if (status) {
            where.status = status;
        }
        if (user.role !== 'ADMIN') {
            where.farmZone = {
                ownerId: user.id
            };
        }
        const [total, crops] = await Promise.all([
            prisma_1.default.crop.count({ where }),
            prisma_1.default.crop.findMany({
                where,
                skip,
                take,
                include: {
                    farmZone: {
                        select: {
                            id: true,
                            name: true,
                            ownerId: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: crops,
            metadata: {
                page: Number(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        };
    }
    static async getCropById(id, user) {
        const crop = await prisma_1.default.crop.findUnique({
            where: { id },
            include: {
                farmZone: true
            }
        });
        if (!crop) {
            throw new Error('Không tìm thấy cây trồng');
        }
        if (user.role !== 'ADMIN' && crop.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền truy cập cây trồng này');
        }
        return crop;
    }
    static async createCrop(data, user) {
        // Verify farmZone ownership
        const farmZone = await prisma_1.default.farmZone.findUnique({
            where: { id: data.farmZoneId }
        });
        if (!farmZone) {
            throw new Error('Không tìm thấy vùng canh tác');
        }
        if (user.role !== 'ADMIN' && farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền thêm cây trồng vào vùng canh tác này');
        }
        return prisma_1.default.crop.create({
            data: {
                ...data,
                plantedDate: new Date(data.plantedDate),
                expectedHarvestDate: data.expectedHarvestDate ? new Date(data.expectedHarvestDate) : null,
            },
        });
    }
    static async updateCrop(id, data, user) {
        const existingCrop = await prisma_1.default.crop.findUnique({
            where: { id },
            include: { farmZone: true }
        });
        if (!existingCrop) {
            throw new Error('Không tìm thấy cây trồng');
        }
        if (user.role !== 'ADMIN' && existingCrop.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền chỉnh sửa cây trồng này');
        }
        if (data.farmZoneId) {
            const farmZone = await prisma_1.default.farmZone.findUnique({
                where: { id: data.farmZoneId }
            });
            if (!farmZone || (user.role !== 'ADMIN' && farmZone.ownerId !== user.id)) {
                throw new Error('Bạn không có quyền chuyển cây trồng sang vùng canh tác này');
            }
        }
        const updateData = { ...data };
        if (data.plantedDate)
            updateData.plantedDate = new Date(data.plantedDate);
        if (data.expectedHarvestDate)
            updateData.expectedHarvestDate = new Date(data.expectedHarvestDate);
        return prisma_1.default.crop.update({
            where: { id },
            data: updateData,
        });
    }
    static async deleteCrop(id, user) {
        const existingCrop = await prisma_1.default.crop.findUnique({
            where: { id },
            include: { farmZone: true }
        });
        if (!existingCrop) {
            throw new Error('Không tìm thấy cây trồng');
        }
        if (user.role !== 'ADMIN' && existingCrop.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền xóa cây trồng này');
        }
        await prisma_1.default.crop.delete({
            where: { id },
        });
        return true;
    }
}
exports.CropService = CropService;
