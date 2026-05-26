import prisma from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';

export class StatisticsService {
  static async getOverview(user: JwtPayload) {
    const farmZoneFilter = user.role === 'ADMIN' ? {} : { ownerId: user.id };

    const totalFarmZones = await prisma.farmZone.count({
      where: farmZoneFilter,
    });

    const totalCrops = await prisma.crop.count({
      where: {
        farmZone: farmZoneFilter,
      },
    });

    const totalSensors = await prisma.sensor.count({
      where: {
        farmZone: farmZoneFilter,
      },
    });

    const openAlerts = await prisma.alert.count({
      where: {
        farmZone: farmZoneFilter,
        status: 'OPEN',
      },
    });

    const criticalAlerts = await prisma.alert.count({
      where: {
        farmZone: farmZoneFilter,
        severity: 'CRITICAL',
        status: 'OPEN',
      },
    });

    const readingsAgg = await prisma.sensorReading.aggregate({
      where: {
        farmZone: farmZoneFilter,
      },
      _avg: {
        temperature: true,
        airHumidity: true,
        soilMoisture: true,
        lightIntensity: true,
      },
    });

    return {
      totalFarmZones,
      totalCrops,
      totalSensors,
      openAlerts,
      criticalAlerts,
      averageTemperature: readingsAgg._avg.temperature || 0,
      averageAirHumidity: readingsAgg._avg.airHumidity || 0,
      averageSoilMoisture: readingsAgg._avg.soilMoisture || 0,
      averageLightIntensity: readingsAgg._avg.lightIntensity || 0,
    };
  }

  static async getAlertStats(user: JwtPayload, from?: string, to?: string) {
    const whereClause: any = {};

    if (user.role !== 'ADMIN') {
      whereClause.farmZone = { ownerId: user.id };
    }

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }

    const byType = await prisma.alert.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        _all: true,
      },
    });

    const bySeverity = await prisma.alert.groupBy({
      by: ['severity'],
      where: whereClause,
      _count: {
        _all: true,
      },
    });

    const byStatus = await prisma.alert.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        _all: true,
      },
    });

    return {
      byType: byType.map((item) => ({ type: item.type, count: item._count._all })),
      bySeverity: bySeverity.map((item) => ({
        severity: item.severity,
        count: item._count._all,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
    };
  }

  static async getReadingStats(query: any, user: JwtPayload) {
    const from = query.from
      ? new Date(query.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();
    const groupBy = query.groupBy ?? 'day';

    let allowedFarmZoneIds: string[] = [];

    if (user.role === 'ADMIN') {
      const zones = await prisma.farmZone.findMany({
        select: { id: true },
      });
      allowedFarmZoneIds = zones.map((zone) => zone.id);
    } else {
      const zones = await prisma.farmZone.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      allowedFarmZoneIds = zones.map((zone) => zone.id);
    }

    if (query.farmZoneId) {
      if (!allowedFarmZoneIds.includes(query.farmZoneId)) {
        return [];
      }

      allowedFarmZoneIds = [query.farmZoneId];
    }

    if (allowedFarmZoneIds.length === 0) {
      return [];
    }

    const readings = await prisma.sensorReading.findMany({
      where: {
        farmZoneId: {
          in: allowedFarmZoneIds,
        },
        recordedAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        recordedAt: true,
        temperature: true,
        airHumidity: true,
        soilMoisture: true,
        lightIntensity: true,
      },
      orderBy: {
        recordedAt: 'asc',
      },
    });

    const buckets = new Map<
      string,
      {
        period: string;
        count: number;
        totalTemperature: number;
        totalAirHumidity: number;
        totalSoilMoisture: number;
        totalLightIntensity: number;
      }
    >();

    for (const reading of readings) {
      const date = reading.recordedAt;

      const period =
        groupBy === 'hour'
          ? date.toISOString().slice(0, 13) + ':00:00.000Z'
          : date.toISOString().slice(0, 10);

      const current =
        buckets.get(period) ??
        {
          period,
          count: 0,
          totalTemperature: 0,
          totalAirHumidity: 0,
          totalSoilMoisture: 0,
          totalLightIntensity: 0,
        };

      current.count += 1;
      current.totalTemperature += reading.temperature ?? 0;
      current.totalAirHumidity += reading.airHumidity ?? 0;
      current.totalSoilMoisture += reading.soilMoisture ?? 0;
      current.totalLightIntensity += reading.lightIntensity ?? 0;

      buckets.set(period, current);
    }

    return Array.from(buckets.values()).map((bucket) => {
      const averageTemperature = Number(
        (bucket.totalTemperature / bucket.count).toFixed(2),
      );
      const averageAirHumidity = Number(
        (bucket.totalAirHumidity / bucket.count).toFixed(2),
      );
      const averageSoilMoisture = Number(
        (bucket.totalSoilMoisture / bucket.count).toFixed(2),
      );
      const averageLightIntensity = Number(
        (bucket.totalLightIntensity / bucket.count).toFixed(2),
      );

      return {
        period: bucket.period,
        date: bucket.period,
        count: bucket.count,
        averageTemperature,
        averageAirHumidity,
        averageSoilMoisture,
        averageLightIntensity,
        avgTemperature: averageTemperature,
        avgAirHumidity: averageAirHumidity,
        avgSoilMoisture: averageSoilMoisture,
        avgLightIntensity: averageLightIntensity,
      };
    });
  }
}
