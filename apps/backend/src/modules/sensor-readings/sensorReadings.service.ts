import prisma from '../../config/prisma';

export class SensorReadingService {
  static async getReadings(filters: any, pagination: { page: number; limit: number }) {
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

    const [data, total] = await Promise.all([
      prisma.sensorReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
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

  static async getLatestReadings() {
    // Get latest reading per farmZone
    const farmZones = await prisma.farmZone.findMany({
      select: { id: true }
    });

    const latestReadings = await Promise.all(
      farmZones.map(async (zone) => {
        const reading = await prisma.sensorReading.findFirst({
          where: { farmZoneId: zone.id },
          orderBy: { recordedAt: 'desc' },
        });
        return {
          farmZoneId: zone.id,
          reading,
        };
      })
    );
    return latestReadings.filter((item) => item.reading !== null);
  }

  static async createReading(data: any) {
    return prisma.sensorReading.create({
      data,
    });
  }

  static async deleteReading(id: string) {
    return prisma.sensorReading.delete({
      where: { id },
    });
  }
}
