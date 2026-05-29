import prisma from '../config/prisma';
import { ExportsService } from '../modules/exports/exports.service';
import type { JwtPayload } from '../utils/jwt';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    farmZone: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    sensorReading: {
      findMany: jest.fn(),
    },
    alert: {
      findMany: jest.fn(),
    },
  },
}));

describe('ExportsService', () => {
  const user: JwtPayload = {
    id: 'user-1',
    email: 'owner@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      name: 'Nguyen Van A',
      email: 'owner@example.com',
    });
    (prisma.farmZone.findMany as jest.Mock).mockResolvedValue([
      { id: 'zone-1', name: 'Khu A' },
    ]);
    (prisma.sensorReading.findMany as jest.Mock).mockResolvedValue([
      {
        farmZone: { id: 'zone-1', name: 'Khu A' },
        sensor: {
          name: 'Cam bien 1',
          code: 'SEN-001',
          type: 'ALL_IN_ONE',
        },
        recordedAt: new Date('2026-05-28T08:00:00.000Z'),
        temperature: 30,
        airHumidity: 70,
        soilMoisture: 45,
        lightIntensity: 1200,
      },
    ]);
    (prisma.alert.findMany as jest.Mock).mockResolvedValue([
      {
        farmZone: { id: 'zone-1', name: 'Khu A' },
        createdAt: new Date('2026-05-28T08:05:00.000Z'),
        resolvedAt: null,
        type: 'HIGH_TEMPERATURE',
        severity: 'CRITICAL',
        status: 'OPEN',
        title: 'Nhiet do cao',
        message: 'Nhiet do vuot nguong',
      },
    ]);
  });

  it('builds a multi-sheet smart farm report workbook', async () => {
    const workbook = await ExportsService.exportReadings(
      user,
      undefined,
      '2026-05-01',
      '2026-05-28',
    );

    expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
      'Tổng quan',
      'Dữ liệu cảm biến',
      'Cảnh báo',
    ]);

    const overviewSheet = workbook.getWorksheet('Tổng quan');
    const readingsSheet = workbook.getWorksheet('Dữ liệu cảm biến');
    const alertsSheet = workbook.getWorksheet('Cảnh báo');

    expect(overviewSheet?.getCell('A1').value).toBe('BÁO CÁO SMART FARM');
    expect(overviewSheet?.getCell('B8').value).toBe(1);
    expect(overviewSheet?.getCell('E7').value).toBe(30);
    expect(readingsSheet?.getCell('A5').value).toBe('STT');
    expect(readingsSheet?.getCell('B6').value).toBe('Khu A');
    expect(alertsSheet?.getCell('G6').value).toBe('Nhiet do cao');

    const buffer = await workbook.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    expect(prisma.sensorReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          farmZoneId: { in: ['zone-1'] },
          recordedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
      }),
    );
    expect(prisma.alert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          farmZoneId: { in: ['zone-1'] },
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
      }),
    );
  });

  it('builds a timestamped report filename in Vietnam time', () => {
    expect(ExportsService.buildReportFilename(new Date('2026-05-28T08:30:00.000Z'))).toBe(
      'smart-farm-report-2026-05-28-15-30.xlsx',
    );
  });
});
