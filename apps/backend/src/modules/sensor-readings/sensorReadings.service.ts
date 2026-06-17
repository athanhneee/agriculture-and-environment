import prisma from "../../config/prisma";
import { JwtPayload } from "../../utils/jwt";
import { AlertService } from "../alerts/alerts.service";
import { emitFarmZoneScopedEvent } from "../../sockets/socket";

export class SensorReadingService {
  static async getReadings(
    filters: any,
    pagination: { page: number; limit: number },
    user: JwtPayload,
  ) {
    const { farmZoneId, sensorId, from, to } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (farmZoneId) where.farmZoneId = farmZoneId;
    if (sensorId) where.sensorId = sensorId;

    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }

    if (user.role !== "ADMIN") {
      where.farmZone = {
        ownerId: user.id,
      };
    }

    const [data, total] = await Promise.all([
      prisma.sensorReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: "desc" },
        include: {
          sensor: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              unit: true,
            },
          },
          farmZone: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.sensorReading.count({ where }),
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

  static async getLatestReadings(user: JwtPayload) {
    const farmZones = await prisma.farmZone.findMany({
      where: user.role === "ADMIN" ? {} : { ownerId: user.id },
      select: { id: true },
    });

    const latestReadings = await Promise.all(
      farmZones.map(async (zone: { id: string }) => {
        const reading = await prisma.sensorReading.findFirst({
          where: {
            farmZoneId: zone.id,
            sensor: {
              status: "ACTIVE"
            }
          },
          orderBy: { recordedAt: "desc" },
        });

        return {
          farmZoneId: zone.id,
          reading,
        };
      }),
    );

    return latestReadings.filter((item) => item.reading !== null);
  }

  static async createReading(data: any) {
    const sensor = await prisma.sensor.findUnique({
      where: { id: data.sensorId },
      include: { farmZone: true },
    });

    if (!sensor) {
      throw { statusCode: 404, message: "Không tìm thấy cảm biến" };
    }

    if (sensor.farmZoneId !== data.farmZoneId) {
      throw {
        statusCode: 400,
        message: "Cảm biến không thuộc vùng trồng được chọn",
      };
    }

    const reading = await prisma.sensorReading.create({
      data,
    });

    await AlertService.processNewReading(reading.id);

    try {
      const payload = {
        farmZoneId: reading.farmZoneId,
        reading,
        timestamp: reading.recordedAt,
      };

      emitFarmZoneScopedEvent(
        reading.farmZoneId,
        sensor.farmZone.ownerId,
        "sensor:reading-created",
        payload,
      );
      emitFarmZoneScopedEvent(
        reading.farmZoneId,
        sensor.farmZone.ownerId,
        "sensor:global-reading",
        payload,
      );
    } catch {
      console.warn("Socket.io chưa khởi tạo, bỏ qua emit realtime");
    }

    return reading;
  }

  static async deleteReading(id: string) {
    return prisma.sensorReading.deleteMany({
      where: { id },
    });
  }
}
