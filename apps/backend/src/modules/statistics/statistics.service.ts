import prisma from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';

export class StatisticsService {
  static async getOverview(user: JwtPayload) {
    const farmZoneFilter = user.role === 'ADMIN' ? {} : { ownerId: user.id };

    // 1. Total Farm Zones
    const totalFarmZones = await prisma.farmZone.count({
      where: farmZoneFilter,
    });

    // 2. Total Crops (in user's zones)
    const totalCrops = await prisma.crop.count({
      where: {
        farmZone: farmZoneFilter,
      },
    });

    // 3. Total Sensors
    const totalSensors = await prisma.sensor.count({
      where: {
        farmZone: farmZoneFilter,
      },
    });

    // 4. Alerts
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

    // 5. Averages of current state or overall (we will just take average of all readings)
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
    const whereClause: any = {
      farmZone: user.role === 'ADMIN' ? undefined : { ownerId: user.id },
    };

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
      byType: byType.map(item => ({ type: item.type, count: item._count._all })),
      bySeverity: bySeverity.map(item => ({ severity: item.severity, count: item._count._all })),
      byStatus: byStatus.map(item => ({ status: item.status, count: item._count._all })),
    };
  }

  static async getReadingStats(user: JwtPayload, farmZoneId?: string, from?: string, to?: string) {
    // Determine which farm zones the user has access to
    let allowedFarmZoneIds: string[] = [];
    
    if (farmZoneId) {
      // User specified a farm zone, check if they own it (if not admin)
      if (user.role !== 'ADMIN') {
        const zone = await prisma.farmZone.findFirst({
          where: { id: farmZoneId, ownerId: user.id },
        });
        if (!zone) {
          throw new Error('Bạn không có quyền truy cập dữ liệu của khu vực này');
        }
      }
      allowedFarmZoneIds = [farmZoneId];
    } else {
      // User didn't specify, get all their zones or all zones if admin
      const zones = await prisma.farmZone.findMany({
        where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
        select: { id: true },
      });
      allowedFarmZoneIds = zones.map(z => z.id);
    }

    if (allowedFarmZoneIds.length === 0) {
      return [];
    }

    // Build the query using Raw SQL for Date Grouping
    // Prisma $queryRaw uses template literals for safety against SQL injection
    
    const conditions = [];
    if (from) {
      conditions.push(`"recordedAt" >= '${new Date(from).toISOString()}'`);
    }
    if (to) {
      conditions.push(`"recordedAt" <= '${new Date(to).toISOString()}'`);
    }
    
    // Convert array of UUIDs to SQL IN clause format safely
    const inClause = allowedFarmZoneIds.map(id => `'${id}'`).join(',');
    conditions.push(`"farmZoneId" IN (${inClause})`);

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const rawQuery = `
      SELECT 
        DATE("recordedAt") as "date",
        AVG("temperature") as "avgTemperature",
        AVG("airHumidity") as "avgAirHumidity",
        AVG("soilMoisture") as "avgSoilMoisture",
        AVG("lightIntensity") as "avgLightIntensity"
      FROM "SensorReading"
      ${whereSql}
      GROUP BY DATE("recordedAt")
      ORDER BY "date" ASC
    `;

    const results: any[] = await prisma.$queryRawUnsafe(rawQuery);

    return results.map(row => ({
      date: row.date.toISOString().split('T')[0],
      avgTemperature: row.avgTemperature ? Number(row.avgTemperature) : 0,
      avgAirHumidity: row.avgAirHumidity ? Number(row.avgAirHumidity) : 0,
      avgSoilMoisture: row.avgSoilMoisture ? Number(row.avgSoilMoisture) : 0,
      avgLightIntensity: row.avgLightIntensity ? Number(row.avgLightIntensity) : 0,
    }));
  }
}
