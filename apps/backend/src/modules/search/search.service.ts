import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';

export class SearchService {
  static async globalSearch(query: string, user: JwtPayload) {
    const q = query.trim();
    const isUser = user.role !== 'ADMIN';
    const ownerFilter = isUser ? { ownerId: user.id } : {};
    const cropSensorOwnerFilter = isUser ? { farmZone: { ownerId: user.id } } : {};

    const zoneSearchFilter: Prisma.FarmZoneWhereInput = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { soilType: { contains: q, mode: 'insensitive' } },
      ]
    } : {};

    const cropSearchFilter: Prisma.CropWhereInput = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { variety: { contains: q, mode: 'insensitive' } },
      ]
    } : {};

    const sensorSearchFilter: Prisma.SensorWhereInput = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
      ]
    } : {};

    const [zones, crops, sensors] = await Promise.all([
      prisma.farmZone.findMany({
        where: {
          ...ownerFilter,
          ...zoneSearchFilter
        },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          area: true,
          soilType: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.crop.findMany({
        where: {
          ...cropSensorOwnerFilter,
          ...cropSearchFilter
        },
        take: 5,
        select: {
          id: true,
          name: true,
          variety: true,
          status: true,
          farmZone: { select: { name: true, id: true } },
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sensor.findMany({
        where: {
          ...cropSensorOwnerFilter,
          ...sensorSearchFilter
        },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          status: true,
          farmZone: { select: { name: true, id: true } },
        },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    return {
      zones,
      crops,
      sensors,
    };
  }
}
