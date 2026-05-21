"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmZoneService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class FarmZoneService {
    static async getFarmZones(query, user) {
        const { page = 1, limit = 10, search, status } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (user.role !== 'ADMIN') {
            where.ownerId = user.id;
        }
        if (search) {
            where.name = { contains: String(search), mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }
        const [total, farmZones] = await Promise.all([
            prisma_1.default.farmZone.count({ where }),
            prisma_1.default.farmZone.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: farmZones,
            metadata: {
                page: Number(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        };
    }
    static async getFarmZoneById(id, user) {
        const farmZone = await prisma_1.default.farmZone.findUnique({
            where: { id },
            include: {
                crops: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                sensors: {
                    include: {
                        readings: {
                            orderBy: { recordedAt: 'desc' },
                            take: 1
                        }
                    }
                },
                alerts: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
        if (!farmZone) {
            throw new Error('Không tìm thấy vùng canh tác');
        }
        if (user.role !== 'ADMIN' && farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền truy cập vùng canh tác này');
        }
        return farmZone;
    }
    static async createFarmZone(data, user) {
        return prisma_1.default.farmZone.create({
            data: {
                ...data,
                ownerId: user.id,
            },
        });
    }
    static async updateFarmZone(id, data, user) {
        const existingZone = await prisma_1.default.farmZone.findUnique({ where: { id } });
        if (!existingZone) {
            throw new Error('Không tìm thấy vùng canh tác');
        }
        if (user.role !== 'ADMIN' && existingZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền chỉnh sửa vùng canh tác này');
        }
        return prisma_1.default.farmZone.update({
            where: { id },
            data,
        });
    }
    static async deleteFarmZone(id, user) {
        const existingZone = await prisma_1.default.farmZone.findUnique({ where: { id } });
        if (!existingZone) {
            throw new Error('Không tìm thấy vùng canh tác');
        }
        if (user.role !== 'ADMIN' && existingZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền xóa vùng canh tác này');
        }
        // Cascade delete is handled by Prisma schema (onDelete: Cascade)
        await prisma_1.default.farmZone.delete({
            where: { id },
        });
        return true;
    }
}
exports.FarmZoneService = FarmZoneService;
