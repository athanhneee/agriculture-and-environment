import prisma from '../../config/prisma';
import { evaluateReadingForAlerts } from './alertRules';
import { getIO } from '../../sockets/socket';

export class AlertService {
  static async getAlerts(filters: any, pagination: { page: number; limit: number }) {
    const { farmZoneId, status, severity, type, from, to } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmZoneId) where.farmZoneId = farmZoneId;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          farmZone: { select: { id: true, name: true } },
        }
      }),
      prisma.alert.count({ where }),
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

  static async getAlertById(id: string) {
    const alert = await prisma.alert.findUnique({
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

  static async acknowledgeAlert(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED' }
    });
  }

  static async resolveAlert(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { 
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });
  }

  static async deleteAlert(id: string) {
    return prisma.alert.delete({
      where: { id },
    });
  }

  static async processNewReading(reading: any) {
    const potentialAlerts = evaluateReadingForAlerts(reading);
    if (potentialAlerts.length === 0) return;

    // Check for spam: 15 minutes window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    for (const pa of potentialAlerts) {
      const existingAlert = await prisma.alert.findFirst({
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
        const newAlert = await prisma.alert.create({
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
          const io = getIO();
          io.to(`farm-zone:${reading.farmZoneId}`).emit('alert:created', newAlert);
          io.emit('alert:global', newAlert);
        } catch (err) {
          console.error('Socket IO not initialized yet, skipping emit');
        }
      }
    }
  }
}
