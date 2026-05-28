import prisma from '../../config/prisma';
import { emitFarmZoneScopedEvent } from '../../sockets/socket';
import { JwtPayload } from '../../utils/jwt';
import { evaluateReadingForAlerts } from './alertRules';

type AlertFilters = {
  status?: string;
  severity?: string;
  type?: string;
  farmZoneId?: string;
};

type Pagination = {
  page: number;
  limit: number;
};

function toHttpError(statusCode: number, message: string) {
  return { statusCode, message };
}

function getUserFarmZoneScope(user: JwtPayload) {
  if (user.role === 'ADMIN') return {};
  return { ownerId: user.id };
}

export class AlertService {
  static async getAlerts(
    filters: AlertFilters,
    pagination: Pagination,
    user: JwtPayload,
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.type) where.type = filters.type;
    if (filters.farmZoneId) where.farmZoneId = filters.farmZoneId;

    if (user.role !== 'ADMIN') {
      where.farmZone = {
        ownerId: user.id,
      };
    }

    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          farmZone: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
          sensorReading: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAlertById(id: string, user: JwtPayload) {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        farmZone: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        sensorReading: true,
      },
    });

    if (!alert) {
      throw toHttpError(404, 'Không tìm thấy cảnh báo');
    }

    if (user.role !== 'ADMIN' && alert.farmZone.ownerId !== user.id) {
      throw toHttpError(403, 'Bạn không có quyền xem cảnh báo này');
    }

    return alert;
  }

  static async acknowledgeAlert(id: string, user: JwtPayload) {
    await this.getAlertById(id, user);

    return prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
      },
      include: {
        farmZone: true,
        sensorReading: true,
      },
    });
  }

  static async resolveAlert(id: string, user: JwtPayload) {
    await this.getAlertById(id, user);

    return prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
      },
      include: {
        farmZone: true,
        sensorReading: true,
      },
    });
  }

  static async deleteAlert(id: string, user: JwtPayload) {
    await this.getAlertById(id, user);

    await prisma.alert.delete({
      where: { id },
    });

    return {
      message: 'Xóa cảnh báo thành công',
    };
  }

  static async processNewReading(readingId: string) {
    const reading = await prisma.sensorReading.findUnique({
      where: { id: readingId },
      include: {
        farmZone: true,
      },
    });

    if (!reading) return [];

    const possibleAlerts = evaluateReadingForAlerts(reading);

    if (possibleAlerts.length === 0) {
      return [];
    }

    const createdAlerts = [];

    for (const possibleAlert of possibleAlerts) {
      const alert = await prisma.alert.create({
        data: {
          title: possibleAlert.title,
          message: possibleAlert.message,
          type: possibleAlert.type,
          severity: possibleAlert.severity,
          farmZoneId: reading.farmZoneId,
          sensorReadingId: reading.id,
        },
        include: {
          farmZone: true,
          sensorReading: true,
        },
      });

      createdAlerts.push(alert);
    }

    try {
      for (const alert of createdAlerts) {
        emitFarmZoneScopedEvent(
          alert.farmZoneId,
          alert.farmZone.ownerId,
          'alert:created',
          alert,
        );
        emitFarmZoneScopedEvent(
          alert.farmZoneId,
          alert.farmZone.ownerId,
          'alert:global-created',
          alert,
        );
        emitFarmZoneScopedEvent(
          alert.farmZoneId,
          alert.farmZone.ownerId,
          'alert:global',
          alert,
        );
      }
    } catch {
      // Socket chưa khởi tạo thì bỏ qua, không làm hỏng luồng tạo reading.
    }

    return createdAlerts;
  }

  static async countOpenAlertsByUser(user: JwtPayload) {
    return prisma.alert.count({
      where: {
        status: 'OPEN',
        farmZone: getUserFarmZoneScope(user),
      },
    });
  }
}
