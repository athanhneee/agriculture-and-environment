"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const alertRules_1 = require("./alertRules");
const socket_1 = require("../../sockets/socket");
class AlertService {
    static async getAlerts(filters, pagination) {
        const { farmZoneId, status, severity, type, from, to } = filters;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const where = {};
        if (farmZoneId)
            where.farmZoneId = farmZoneId;
        if (status)
            where.status = status;
        if (severity)
            where.severity = severity;
        if (type)
            where.type = type;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        const [data, total] = await Promise.all([
            prisma_1.default.alert.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    farmZone: { select: { id: true, name: true } },
                }
            }),
            prisma_1.default.alert.count({ where }),
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
    static async getAlertById(id) {
        const alert = await prisma_1.default.alert.findUnique({
            where: { id },
            include: {
                farmZone: { select: { id: true, name: true } },
                sensorReading: true,
            }
        });
        if (!alert) {
            throw new Error('Alert not found');
        }
        return alert;
    }
    static async acknowledgeAlert(id) {
        return prisma_1.default.alert.update({
            where: { id },
            data: { status: 'ACKNOWLEDGED' }
        });
    }
    static async resolveAlert(id) {
        return prisma_1.default.alert.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        });
    }
    static async deleteAlert(id) {
        return prisma_1.default.alert.delete({
            where: { id },
        });
    }
    static async processNewReading(reading) {
        const potentialAlerts = (0, alertRules_1.evaluateReadingForAlerts)(reading);
        if (potentialAlerts.length === 0)
            return;
        // Check for spam: 15 minutes window
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        for (const pa of potentialAlerts) {
            const existingAlert = await prisma_1.default.alert.findFirst({
                where: {
                    farmZoneId: reading.farmZoneId,
                    type: pa.type,
                    status: 'OPEN',
                    createdAt: {
                        gte: fifteenMinutesAgo
                    }
                }
            });
            if (!existingAlert) {
                // Create new alert
                const newAlert = await prisma_1.default.alert.create({
                    data: {
                        farmZoneId: reading.farmZoneId,
                        sensorReadingId: reading.id,
                        type: pa.type,
                        severity: pa.severity,
                        title: pa.title,
                        message: pa.message,
                        status: 'OPEN',
                    }
                });
                // Emit via Socket.io
                try {
                    const io = (0, socket_1.getIO)();
                    io.to(`farm-zone:${reading.farmZoneId}`).emit('alert:created', newAlert);
                    io.emit('alert:global', newAlert);
                }
                catch (err) {
                    console.error('Socket IO not initialized yet, skipping emit');
                }
            }
        }
    }
}
exports.AlertService = AlertService;
