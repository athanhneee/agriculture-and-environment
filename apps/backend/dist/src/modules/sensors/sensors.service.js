"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class SensorService {
    static async getSensors(query, user) {
        const { page = 1, limit = 10, farmZoneId, type, status } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (farmZoneId) {
            where.farmZoneId = String(farmZoneId);
        }
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }
        // Access control
        if (user.role !== 'ADMIN') {
            where.farmZone = {
                ownerId: user.id
            };
        }
        const [total, sensors] = await Promise.all([
            prisma_1.default.sensor.count({ where }),
            prisma_1.default.sensor.findMany({
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
            data: sensors,
            metadata: {
                page: Number(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        };
    }
    static async getSensorById(id, user) {
        const sensor = await prisma_1.default.sensor.findUnique({
            where: { id },
            include: {
                farmZone: true
            }
        });
        if (!sensor) {
            throw new Error('Không tìm thấy cảm biến');
        }
        if (user.role !== 'ADMIN' && sensor.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền truy cập cảm biến này');
        }
        return sensor;
    }
    static async createSensor(data, user) {
        const farmZone = await prisma_1.default.farmZone.findUnique({
            where: { id: data.farmZoneId }
        });
        if (!farmZone) {
            throw new Error('Không tìm thấy vùng canh tác');
        }
        if (user.role !== 'ADMIN' && farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền thêm cảm biến vào vùng canh tác này');
        }
        // Check code uniqueness
        const existingSensorCode = await prisma_1.default.sensor.findUnique({
            where: { code: data.code }
        });
        if (existingSensorCode) {
            throw new Error('Mã cảm biến đã tồn tại');
        }
        return prisma_1.default.sensor.create({
            data,
        });
    }
    static async updateSensor(id, data, user) {
        const existingSensor = await prisma_1.default.sensor.findUnique({
            where: { id },
            include: { farmZone: true }
        });
        if (!existingSensor) {
            throw new Error('Không tìm thấy cảm biến');
        }
        if (user.role !== 'ADMIN' && existingSensor.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền chỉnh sửa cảm biến này');
        }
        if (data.farmZoneId) {
            const farmZone = await prisma_1.default.farmZone.findUnique({
                where: { id: data.farmZoneId }
            });
            if (!farmZone || (user.role !== 'ADMIN' && farmZone.ownerId !== user.id)) {
                throw new Error('Bạn không có quyền chuyển cảm biến sang vùng canh tác này');
            }
        }
        if (data.code && data.code !== existingSensor.code) {
            const existingSensorCode = await prisma_1.default.sensor.findUnique({
                where: { code: data.code }
            });
            if (existingSensorCode) {
                throw new Error('Mã cảm biến đã tồn tại');
            }
        }
        return prisma_1.default.sensor.update({
            where: { id },
            data,
        });
    }
    static async deleteSensor(id, user) {
        const existingSensor = await prisma_1.default.sensor.findUnique({
            where: { id },
            include: { farmZone: true }
        });
        if (!existingSensor) {
            throw new Error('Không tìm thấy cảm biến');
        }
        if (user.role !== 'ADMIN' && existingSensor.farmZone.ownerId !== user.id) {
            throw new Error('Bạn không có quyền xóa cảm biến này');
        }
        await prisma_1.default.sensor.delete({
            where: { id },
        });
        return true;
    }
}
exports.SensorService = SensorService;
