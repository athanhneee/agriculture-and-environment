import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateFarmZoneInput, UpdateFarmZoneInput } from './farm-zones.validation';
import { JwtPayload } from '../../utils/jwt';

export class FarmZoneService {
  static async getFarmZones(query: any, user: JwtPayload) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.FarmZoneWhereInput = {};
    
    if (user.role !== 'ADMIN') {
      where.ownerId = user.id;
    }

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    if (status) {
      where.status = status as any;
    }

    const [total, farmZones] = await Promise.all([
      prisma.farmZone.count({ where }),
      prisma.farmZone.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: farmZones,
      metadata: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getFarmZoneById(id: string, user: JwtPayload) {
    const farmZone = await prisma.farmZone.findUnique({
      where: { id },
      include: {
        crops: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        sensors: {
          include: {
            readings: {
              orderBy: { recordedAt: 'desc' },
              take: 1
            }
          }
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!farmZone) {
      throw new Error('Không tìm thấy vùng canh tác');
    }

    if (user.role !== 'ADMIN' && farmZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền truy cập vùng canh tác này');
    }

    return farmZone;
  }

  static async createFarmZone(data: CreateFarmZoneInput, user: JwtPayload) {
    return prisma.farmZone.create({
      data: {
        ...data,
        ownerId: user.id,
      },
    });
  }

  static async updateFarmZone(id: string, data: UpdateFarmZoneInput, user: JwtPayload) {
    const existingZone = await prisma.farmZone.findUnique({ where: { id } });
    if (!existingZone) {
      throw new Error('Không tìm thấy vùng canh tác');
    }

    if (user.role !== 'ADMIN' && existingZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền chỉnh sửa vùng canh tác này');
    }

    return prisma.farmZone.update({
      where: { id },
      data,
    });
  }

  static async deleteFarmZone(id: string, user: JwtPayload) {
    const existingZone = await prisma.farmZone.findUnique({ where: { id } });
    if (!existingZone) {
      throw new Error('Không tìm thấy vùng canh tác');
    }

    if (user.role !== 'ADMIN' && existingZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền xóa vùng canh tác này');
    }

    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    await prisma.farmZone.delete({
      where: { id },
    });

    return true;
  }
}
