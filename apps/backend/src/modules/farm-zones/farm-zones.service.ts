import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateFarmZoneInput,
  UpdateFarmZoneInput,
} from "./farm-zones.validation";
import { JwtPayload } from "../../utils/jwt";

function mapFarmZoneDto(zone: any) {
  const latestReading =
    zone.sensorReadings && zone.sensorReadings.length > 0
      ? zone.sensorReadings[0]
      : null;

  const latestCrop =
    zone.crops && zone.crops.length > 0 ? zone.crops[0] : null;

  const openAlertsCount =
    zone._count?.alerts ??
    zone.alerts?.filter((a: any) => a.status === "OPEN").length ??
    0;

  return {
    ...zone,
    cropName: latestCrop?.name ?? null,
    latestSensorSummary: latestReading
      ? {
        temperature: latestReading.temperature,
        airHumidity: latestReading.airHumidity,
        soilMoisture: latestReading.soilMoisture,
        lightIntensity: latestReading.lightIntensity,
        recordedAt: latestReading.recordedAt,
      }
      : null,
    openAlertsCount,
  };
}

export class FarmZoneService {
  static async getFarmZones(query: any, user: JwtPayload) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.FarmZoneWhereInput = {};

    if (user.role !== "ADMIN") {
      where.ownerId = user.id;
    }

    if (search) {
      where.name = { contains: String(search), mode: "insensitive" };
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
        orderBy: { createdAt: "desc" },
        include: {
          crops: {
            orderBy: { plantedDate: "desc" },
            take: 1,
          },
          sensors: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              unit: true,
            },
          },
          sensorReadings: {
            where: {
              sensor: {
                status: "ACTIVE"
              }
            },
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              alerts: {
                where: { status: "OPEN" },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: farmZones.map(mapFarmZoneDto),
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
          orderBy: { plantedDate: "desc" },
          take: 5,
        },
        sensors: {
          include: {
            readings: {
              orderBy: { recordedAt: "desc" },
              take: 1,
            },
          },
        },
        sensorReadings: {
          where: {
            sensor: {
              status: "ACTIVE"
            }
          },
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            alerts: {
              where: { status: "OPEN" },
            },
          },
        },
      },
    });

    if (!farmZone) {
      throw new Error("Không tìm thấy vùng canh tác");
    }

    if (user.role !== "ADMIN" && farmZone.ownerId !== user.id) {
      throw new Error("Bạn không có quyền truy cập vùng canh tác này");
    }

    return mapFarmZoneDto(farmZone);
  }

  static async createFarmZone(data: CreateFarmZoneInput, user: JwtPayload) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem vùng trồng');
    }

    const existingName = await prisma.farmZone.findFirst({
      where: { ownerId: user.id, name: data.name }
    });
    if (existingName) {
      throw new Error(`Tên vùng trồng "${data.name}" đã tồn tại.`);
    }

    const existingLocation = await prisma.farmZone.findFirst({
      where: { latitude: data.latitude, longitude: data.longitude }
    });
    if (existingLocation) {
      throw new Error(`Vị trí (vĩ độ: ${data.latitude}, kinh độ: ${data.longitude}) đã được đăng ký cho vùng trồng khác trong hệ thống.`);
    }

    return prisma.farmZone.create({
      data: {
        ...data,
        ownerId: user.id,
      },
    });
  }

  static async updateFarmZone(
    id: string,
    data: UpdateFarmZoneInput,
    user: JwtPayload,
  ) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem vùng trồng');
    }

    const existingZone = await prisma.farmZone.findUnique({ where: { id } });

    if (!existingZone) {
      throw new Error("Không tìm thấy vùng canh tác");
    }

    if (user.role !== "ADMIN" && existingZone.ownerId !== user.id) {
      throw new Error("Bạn không có quyền chỉnh sửa vùng canh tác này");
    }

    if (data.name && data.name !== existingZone.name) {
      const duplicateName = await prisma.farmZone.findFirst({
        where: { ownerId: existingZone.ownerId, name: data.name }
      });
      if (duplicateName) throw new Error(`Tên vùng trồng "${data.name}" đã tồn tại.`);
    }

    const checkLat = data.latitude !== undefined ? data.latitude : existingZone.latitude;
    const checkLng = data.longitude !== undefined ? data.longitude : existingZone.longitude;

    if (checkLat !== existingZone.latitude || checkLng !== existingZone.longitude) {
      const duplicateLocation = await prisma.farmZone.findFirst({
        where: { latitude: checkLat, longitude: checkLng }
      });
      if (duplicateLocation) throw new Error(`Vị trí (vĩ độ: ${checkLat}, kinh độ: ${checkLng}) đã được đăng ký cho vùng trồng khác trong hệ thống.`);
    }

    return prisma.farmZone.update({
      where: { id },
      data,
    });
  }

  static async deleteFarmZone(id: string, user: JwtPayload) {
    if (user.role === 'ADMIN') {
      throw new Error('Quản trị viên chỉ có quyền xem vùng trồng');
    }

    const existingZone = await prisma.farmZone.findUnique({ where: { id } });

    if (!existingZone) {
      throw new Error("Không tìm thấy vùng canh tác");
    }

    if (user.role !== "ADMIN" && existingZone.ownerId !== user.id) {
      throw new Error("Bạn không có quyền xóa vùng canh tác này");
    }

    await prisma.farmZone.delete({
      where: { id },
    });

    return true;
  }
}
