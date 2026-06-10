import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateSensorInput, UpdateSensorInput } from './sensors.validation';
import { JwtPayload } from '../../utils/jwt';

export class SensorService {
  static async getSensors(query: any, user: JwtPayload) {
    const { page = 1, limit = 10, farmZoneId, type, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.SensorWhereInput = {};

    if (farmZoneId) {
      where.farmZoneId = String(farmZoneId);
    }

    if (type) {
      where.type = type as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    // Access control
    if (user.role !== 'ADMIN') {
      where.farmZone = {
        ownerId: user.id
      };
    }

    const [total, sensors] = await Promise.all([
      prisma.sensor.count({ where }),
      prisma.sensor.findMany({
        where,
        skip,
        take,
        include: {
          farmZone: {
            select: {
              id: true,
              name: true,
              ownerId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: sensors,
      metadata: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getSensorById(id: string, user: JwtPayload) {
    const sensor = await prisma.sensor.findUnique({
      where: { id },
      include: {
        farmZone: true
      }
    });

    if (!sensor) {
      throw new Error('Không tìm thấy cảm biến');
    }

    if (user.role !== 'ADMIN' && sensor.farmZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền truy cập cảm biến này');
    }

    return sensor;
  }

  static async createSensor(data: CreateSensorInput, user: JwtPayload) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem cảm biến');
    }

    const farmZone = await prisma.farmZone.findUnique({
      where: { id: data.farmZoneId }
    });

    if (!farmZone) {
      throw new Error('Không tìm thấy vùng canh tác');
    }

    if (user.role !== 'ADMIN' && farmZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền thêm cảm biến vào vùng canh tác này');
    }

    // Check code uniqueness
    const existingSensorCode = await prisma.sensor.findUnique({
      where: { code: data.code }
    });

    if (existingSensorCode) {
      throw new Error('Mã cảm biến đã tồn tại');
    }

    return prisma.sensor.create({
      data,
    });
  }

  static async updateSensor(id: string, data: UpdateSensorInput, user: JwtPayload) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem cảm biến');
    }

    const existingSensor = await prisma.sensor.findUnique({
      where: { id },
      include: { farmZone: true }
    });

    if (!existingSensor) {
      throw new Error('Không tìm thấy cảm biến');
    }

    if (user.role !== 'ADMIN' && existingSensor.farmZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền chỉnh sửa cảm biến này');
    }

    if (data.farmZoneId) {
      const farmZone = await prisma.farmZone.findUnique({
        where: { id: data.farmZoneId }
      });
      if (!farmZone || (user.role !== 'ADMIN' && farmZone.ownerId !== user.id)) {
        throw new Error('Bạn không có quyền chuyển cảm biến sang vùng canh tác này');
      }
    }

    if (data.code && data.code !== existingSensor.code) {
      const existingSensorCode = await prisma.sensor.findUnique({
        where: { code: data.code }
      });

      if (existingSensorCode) {
        throw new Error('Mã cảm biến đã tồn tại');
      }
    }

    return prisma.sensor.update({
      where: { id },
      data,
    });
  }

  static async deleteSensor(id: string, user: JwtPayload) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem cảm biến');
    }

    const existingSensor = await prisma.sensor.findUnique({
      where: { id },
      include: { farmZone: true }
    });

    if (!existingSensor) {
      throw new Error('Không tìm thấy cảm biến');
    }

    if (user.role !== 'ADMIN' && existingSensor.farmZone.ownerId !== user.id) {
      throw new Error('Bạn không có quyền xóa cảm biến này');
    }

    await prisma.sensor.delete({
      where: { id },
    });

    return true;
  }
}
