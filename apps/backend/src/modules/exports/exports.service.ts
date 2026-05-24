import ExcelJS from 'exceljs';
import prisma from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';

export class ExportsService {
  static async exportReadings(user: JwtPayload, farmZoneId?: string, from?: string, to?: string) {
    // Determine which farm zones the user has access to
    let allowedFarmZoneIds: string[] = [];
    
    if (farmZoneId) {
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
      const zones = await prisma.farmZone.findMany({
        where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
        select: { id: true },
      });
      allowedFarmZoneIds = zones.map(z => z.id);
    }

    if (allowedFarmZoneIds.length === 0) {
      throw new Error('Không tìm thấy khu vực nông trại nào');
    }

    const whereClause: any = {
      farmZoneId: { in: allowedFarmZoneIds }
    };
    if (from || to) {
      whereClause.recordedAt = {};
      if (from) whereClause.recordedAt.gte = new Date(from);
      if (to) whereClause.recordedAt.lte = new Date(to);
    }

    const readings = await prisma.sensorReading.findMany({
      where: whereClause,
      include: {
        sensor: true,
        farmZone: true
      },
      orderBy: {
        recordedAt: 'desc'
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lịch sử Cảm biến');

    worksheet.columns = [
      { header: 'Khu vực', key: 'farmZone', width: 25 },
      { header: 'Cảm biến', key: 'sensor', width: 25 },
      { header: 'Thời gian', key: 'recordedAt', width: 25 },
      { header: 'Nhiệt độ (°C)', key: 'temp', width: 15 },
      { header: 'Độ ẩm KQ (%)', key: 'airHum', width: 15 },
      { header: 'Độ ẩm Đất (%)', key: 'soilHum', width: 15 },
      { header: 'Ánh sáng (Lux)', key: 'light', width: 15 },
    ];

    // Format headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    readings.forEach(reading => {
      worksheet.addRow({
        farmZone: reading.farmZone.name,
        sensor: reading.sensor.name,
        recordedAt: reading.recordedAt.toLocaleString('vi-VN'),
        temp: reading.temperature ?? 'N/A',
        airHum: reading.airHumidity ?? 'N/A',
        soilHum: reading.soilMoisture ?? 'N/A',
        light: reading.lightIntensity ?? 'N/A',
      });
    });

    return workbook;
  }

  static async exportAlerts(user: JwtPayload, from?: string, to?: string) {
    const whereClause: any = {
      farmZone: user.role === 'ADMIN' ? undefined : { ownerId: user.id },
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        farmZone: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách Cảnh báo');

    worksheet.columns = [
      { header: 'Khu vực', key: 'farmZone', width: 25 },
      { header: 'Thời gian tạo', key: 'createdAt', width: 25 },
      { header: 'Loại', key: 'type', width: 20 },
      { header: 'Mức độ', key: 'severity', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tiêu đề', key: 'title', width: 30 },
      { header: 'Nội dung', key: 'message', width: 50 },
      { header: 'Thời gian xử lý', key: 'resolvedAt', width: 25 },
    ];

    // Format headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    alerts.forEach(alert => {
      worksheet.addRow({
        farmZone: alert.farmZone.name,
        createdAt: alert.createdAt.toLocaleString('vi-VN'),
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        message: alert.message,
        resolvedAt: alert.resolvedAt ? alert.resolvedAt.toLocaleString('vi-VN') : 'Chưa xử lý',
      });
    });

    return workbook;
  }
}
