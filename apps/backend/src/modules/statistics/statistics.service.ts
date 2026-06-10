import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { JwtPayload } from '../../utils/jwt';

export class StatisticsService {
  static async getOverview(user: JwtPayload) {
    const farmZoneFilter = user.role === 'ADMIN' ? {} : { ownerId: user.id };

    const [
      totalUsers,
      totalFarmZones,
      totalCrops,
      totalSensors,
      openAlerts,
      criticalAlerts,
      readingsAgg
    ] = await Promise.all([
      user.role === 'ADMIN' ? prisma.user.count() : Promise.resolve(0),
      prisma.farmZone.count({ where: farmZoneFilter }),
      prisma.crop.count({ where: { farmZone: farmZoneFilter } }),
      prisma.sensor.count({ where: { farmZone: farmZoneFilter } }),
      prisma.alert.count({ where: { farmZone: farmZoneFilter, status: 'OPEN' } }),
      prisma.alert.count({
        where: { farmZone: farmZoneFilter, severity: 'CRITICAL', status: 'OPEN' },
      }),
      prisma.sensorReading.aggregate({
        where: { farmZone: farmZoneFilter },
        _avg: {
          temperature: true,
          airHumidity: true,
          soilMoisture: true,
          lightIntensity: true,
        },
      })
    ]);

    return {
      totalUsers,
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

    const [byType, bySeverity, byStatus] = await Promise.all([
      prisma.alert.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { _all: true },
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: whereClause,
        _count: { _all: true },
      }),
      prisma.alert.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { _all: true },
      })
    ]);

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

    const formatPeriod = groupBy === 'hour' ? 'YYYY-MM-DD"T"HH24:00:00.000"Z"' : 'YYYY-MM-DD';

    // TỐI ƯU HÓA ĐIỂM 10: Sử dụng Database-level Aggregation (PostgreSQL)
    // Thay vì kéo hàng trăm ngàn dòng về Node.js (tốn >100MB RAM),
    // Query này gộp nhóm trực tiếp trong CSDL và chỉ trả về tối đa 30 dòng (tốn <1KB RAM).
    const aggregatedData = await prisma.$queryRaw<any[]>`
      SELECT 
        TO_CHAR(DATE_TRUNC(${groupBy === 'hour' ? 'hour' : 'day'}, "recordedAt"), ${formatPeriod}) as "period",
        COUNT(*)::int as "count",
        ROUND(AVG("temperature")::numeric, 2)::float as "averageTemperature",
        ROUND(AVG("airHumidity")::numeric, 2)::float as "averageAirHumidity",
        ROUND(AVG("soilMoisture")::numeric, 2)::float as "averageSoilMoisture",
        ROUND(AVG("lightIntensity")::numeric, 2)::float as "averageLightIntensity"
      FROM "SensorReading"
      WHERE "farmZoneId" IN (${Prisma.join(allowedFarmZoneIds)})
        AND "recordedAt" >= ${from} AND "recordedAt" <= ${to}
      GROUP BY DATE_TRUNC(${groupBy === 'hour' ? 'hour' : 'day'}, "recordedAt")
      ORDER BY "period" ASC;
    `;

    return aggregatedData.map((row) => ({
      period: row.period,
      date: row.period,
      count: row.count,
      averageTemperature: row.averageTemperature || 0,
      averageAirHumidity: row.averageAirHumidity || 0,
      averageSoilMoisture: row.averageSoilMoisture || 0,
      averageLightIntensity: row.averageLightIntensity || 0,
      avgTemperature: row.averageTemperature || 0,
      avgAirHumidity: row.averageAirHumidity || 0,
      avgSoilMoisture: row.averageSoilMoisture || 0,
      avgLightIntensity: row.averageLightIntensity || 0,
    }));
  }
}
