"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorReadingService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class SensorReadingService {
    static async getReadings(filters, pagination) {
        const { farmZoneId, sensorId, from, to } = filters;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const where = {};
        if (farmZoneId)
            where.farmZoneId = farmZoneId;
        if (sensorId)
            where.sensorId = sensorId;
        if (from || to) {
            where.recordedAt = {};
            if (from)
                where.recordedAt.gte = new Date(from);
            if (to)
                where.recordedAt.lte = new Date(to);
        }
        const [data, total] = await Promise.all([
            prisma_1.default.sensorReading.findMany({
                where,
                skip,
                take: limit,
                orderBy: { recordedAt: 'desc' },
            }),
            prisma_1.default.sensorReading.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getLatestReadings() {
        // Get latest reading per farmZone
        const farmZones = await prisma_1.default.farmZone.findMany({
            select: { id: true }
        });
        const latestReadings = await Promise.all(farmZones.map(async (zone) => {
            const reading = await prisma_1.default.sensorReading.findFirst({
                where: { farmZoneId: zone.id },
                orderBy: { recordedAt: 'desc' },
            });
            return {
                farmZoneId: zone.id,
                reading,
            };
        }));
        return latestReadings.filter((item) => item.reading !== null);
    }
    static async createReading(data) {
        return prisma_1.default.sensorReading.create({
            data,
        });
    }
    static async deleteReading(id) {
        return prisma_1.default.sensorReading.delete({
            where: { id },
        });
    }
}
exports.SensorReadingService = SensorReadingService;
