import ExcelJS from 'exceljs';
import prisma from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

type ExportFilters = {
  farmZoneId?: string;
  from?: string;
  to?: string;
};

type FarmZoneOption = {
  id: string;
  name: string;
};

type ReadingRow = {
  farmZone: { id: string; name: string };
  sensor: {
    name: string;
    code: string;
    type: string;
  };
  recordedAt: Date;
  temperature: number | null;
  airHumidity: number | null;
  soilMoisture: number | null;
  lightIntensity: number | null;
};

type AlertRow = {
  farmZone: { id: string; name: string };
  createdAt: Date;
  resolvedAt: Date | null;
  type: string;
  severity: string;
  status: string;
  title: string;
  message: string;
};

type ReportContext = {
  exporterName: string;
  generatedAt: Date;
  filters: ExportFilters;
  farmZones: FarmZoneOption[];
  readings: ReadingRow[];
  alerts: AlertRow[];
};

const reportDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VIETNAM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const filenameDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: VIETNAM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const COLORS = {
  primary: 'FF166534',
  primaryDark: 'FF14532D',
  header: 'FF1F2937',
  muted: 'FFF3F4F6',
  border: 'FFE5E7EB',
  white: 'FFFFFFFF',
  warning: 'FFFEF3C7',
  danger: 'FFFEE2E2',
  info: 'FFDBEAFE',
};

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

function formatDateTime(value?: Date | string | null) {
  if (!value) return 'Tất cả';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không hợp lệ';
  return reportDateFormatter.format(date);
}

function formatFilterDate(value?: string) {
  if (!value) return 'Tất cả';

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
  }

  return formatDateTime(value);
}

function buildReportFilename(now = new Date()) {
  const parts = filenameDateFormatter.formatToParts(now).reduce<Record<string, string>>(
    (result, part) => {
      if (part.type !== 'literal') result[part.type] = part.value;
      return result;
    },
    {},
  );

  return `smart-farm-report-${parts.year}-${parts.month}-${parts.day}-${parts.hour}-${parts.minute}.xlsx`;
}

function columnLetter(columnNumber: number) {
  let letter = '';
  let current = columnNumber;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    current = Math.floor((current - remainder) / 26);
  }

  return letter;
}

function applyTitle(
  worksheet: ExcelJS.Worksheet,
  title: string,
  columnCount: number,
) {
  worksheet.mergeCells(1, 1, 1, columnCount);
  const cell = worksheet.getCell(1, 1);
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: COLORS.white } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primary },
  };
  worksheet.getRow(1).height = 30;
}

function applySubHeader(
  worksheet: ExcelJS.Worksheet,
  context: ReportContext,
  columnCount: number,
) {
  const zoneLabel = context.filters.farmZoneId
    ? context.farmZones[0]?.name ?? context.filters.farmZoneId
    : context.farmZones.length > 0
      ? 'Tất cả vùng có quyền truy cập'
      : 'Không có vùng trồng';

  worksheet.mergeCells(2, 1, 2, columnCount);
  worksheet.getCell(2, 1).value = `Người xuất: ${context.exporterName} | Thời gian xuất: ${formatDateTime(context.generatedAt)}`;

  worksheet.mergeCells(3, 1, 3, columnCount);
  worksheet.getCell(3, 1).value = `Bộ lọc: từ ${formatFilterDate(context.filters.from)} đến ${formatFilterDate(context.filters.to)} | Vùng trồng: ${zoneLabel}`;

  [2, 3].forEach((rowNumber) => {
    const row = worksheet.getRow(rowNumber);
    row.font = { color: { argb: 'FF374151' }, size: 10 };
    row.alignment = { vertical: 'middle', horizontal: 'left' };
  });
}

function styleTableHeader(row: ExcelJS.Row, columnCount: number) {
  for (let column = 1; column <= columnCount; column += 1) {
    const cell = row.getCell(column);
    cell.font = { bold: true, color: { argb: COLORS.white } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.header },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = thinBorder;
  }
  row.height = 24;
}

function styleDataRows(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  columnCount: number,
) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    for (let column = 1; column <= columnCount; column += 1) {
      const cell = row.getCell(column);
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'top',
        horizontal: column === 1 ? 'center' : 'left',
        wrapText: true,
      };
    }
  }
}

function applyEmptyState(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  columnCount: number,
  message: string,
) {
  worksheet.mergeCells(rowNumber, 1, rowNumber, columnCount);
  const cell = worksheet.getCell(rowNumber, 1);
  cell.value = message;
  cell.font = { italic: true, color: { argb: 'FF6B7280' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.muted },
  };
  cell.border = thinBorder;
  worksheet.getRow(rowNumber).height = 28;
}

function writeBlock(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  startColumn: number,
  values: Array<Array<string | number>>,
) {
  values.forEach((rowValues, rowIndex) => {
    rowValues.forEach((value, columnIndex) => {
      worksheet.getCell(startRow + rowIndex, startColumn + columnIndex).value = value;
    });
  });
}

function styleOverviewBlock(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  startColumn: number,
  rowCount: number,
  columnCount: number,
) {
  for (let rowNumber = startRow; rowNumber < startRow + rowCount; rowNumber += 1) {
    for (let column = startColumn; column < startColumn + columnCount; column += 1) {
      const cell = worksheet.getCell(rowNumber, column);
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };

      if (rowNumber === startRow) {
        cell.font = { bold: true, color: { argb: COLORS.white } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.header },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  }
}

function average(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === 'number');
  if (numbers.length === 0) return null;

  const total = numbers.reduce((sum, value) => sum + value, 0);
  return Number((total / numbers.length).toFixed(2));
}

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<T, number>>((result, item) => {
    result[item] = (result[item] ?? 0) + 1;
    return result;
  }, {} as Record<T, number>);
}

function getMetricValue(value: number | null) {
  return value === null ? 'N/A' : value;
}

function buildOverviewSheet(workbook: ExcelJS.Workbook, context: ReportContext) {
  const worksheet = workbook.addWorksheet('Tổng quan', {
    views: [{ showGridLines: false }],
  });

  worksheet.columns = [
    { width: 26 },
    { width: 18 },
    { width: 4 },
    { width: 28 },
    { width: 18 },
    { width: 4 },
    { width: 24 },
    { width: 18 },
  ];

  applyTitle(worksheet, 'BÁO CÁO SMART FARM', 8);
  applySubHeader(worksheet, context, 8);

  const openAlerts = context.alerts.filter((alert) => alert.status === 'OPEN').length;
  const criticalAlerts = context.alerts.filter((alert) => alert.severity === 'CRITICAL').length;
  const averageTemperature = average(context.readings.map((reading) => reading.temperature));
  const averageAirHumidity = average(context.readings.map((reading) => reading.airHumidity));
  const averageSoilMoisture = average(context.readings.map((reading) => reading.soilMoisture));
  const averageLightIntensity = average(context.readings.map((reading) => reading.lightIntensity));
  const alertsBySeverity = countBy(context.alerts.map((alert) => alert.severity));
  const alertsByStatus = countBy(context.alerts.map((alert) => alert.status));

  worksheet.mergeCells('A5:B5');
  worksheet.getCell('A5').value = 'Tổng quan dữ liệu';
  worksheet.mergeCells('D5:E5');
  worksheet.getCell('D5').value = 'Trung bình cảm biến';
  worksheet.mergeCells('G5:H5');
  worksheet.getCell('G5').value = 'Cảnh báo';

  ['A5', 'D5', 'G5'].forEach((cellAddress) => {
    const cell = worksheet.getCell(cellAddress);
    cell.font = { bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primaryDark },
    };
  });

  writeBlock(worksheet, 6, 1, [
    ['Chỉ số', 'Giá trị'],
    ['Vùng trồng trong phạm vi', context.farmZones.length],
    ['Bản ghi cảm biến', context.readings.length],
    ['Cảnh báo', context.alerts.length],
    ['Cảnh báo đang mở', openAlerts],
    ['Cảnh báo nghiêm trọng', criticalAlerts],
  ]);

  writeBlock(worksheet, 6, 4, [
    ['Chỉ số', 'Giá trị'],
    ['Nhiệt độ (°C)', getMetricValue(averageTemperature)],
    ['Độ ẩm không khí (%)', getMetricValue(averageAirHumidity)],
    ['Độ ẩm đất (%)', getMetricValue(averageSoilMoisture)],
    ['Ánh sáng (lux)', getMetricValue(averageLightIntensity)],
    ['Số mẫu đo', context.readings.length],
  ]);

  writeBlock(worksheet, 6, 7, [
    ['Phân loại', 'Số lượng'],
    ['INFO', alertsBySeverity.INFO ?? 0],
    ['WARNING', alertsBySeverity.WARNING ?? 0],
    ['CRITICAL', alertsBySeverity.CRITICAL ?? 0],
    ['OPEN', alertsByStatus.OPEN ?? 0],
    ['RESOLVED', alertsByStatus.RESOLVED ?? 0],
  ]);

  styleOverviewBlock(worksheet, 6, 1, 6, 2);
  styleOverviewBlock(worksheet, 6, 4, 6, 2);
  styleOverviewBlock(worksheet, 6, 7, 6, 2);

  [2, 5, 8].forEach((column) => {
    for (let rowNumber = 7; rowNumber <= 11; rowNumber += 1) {
      worksheet.getCell(rowNumber, column).numFmt = '#,##0.00';
    }
  });

  worksheet.mergeCells('A13:H13');
  worksheet.getCell('A13').value =
    'Báo cáo gồm dữ liệu cảm biến và cảnh báo theo phạm vi bộ lọc, dùng cho lưu trữ và đối chiếu định kỳ.';
  worksheet.getCell('A13').font = { italic: true, color: { argb: 'FF4B5563' } };
  worksheet.getCell('A13').alignment = { wrapText: true, vertical: 'middle' };
  worksheet.getRow(13).height = 34;
}

function buildReadingsSheet(workbook: ExcelJS.Workbook, context: ReportContext) {
  const worksheet = workbook.addWorksheet('Dữ liệu cảm biến', {
    views: [{ state: 'frozen', ySplit: 5, showGridLines: false }],
  });
  const columnCount = 10;
  const headerRowNumber = 5;

  worksheet.columns = [
    { width: 8 },
    { width: 24 },
    { width: 20 },
    { width: 24 },
    { width: 20 },
    { width: 23 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ];

  applyTitle(worksheet, 'DỮ LIỆU CẢM BIẾN', columnCount);
  applySubHeader(worksheet, context, columnCount);

  worksheet.getRow(headerRowNumber).values = [
    'STT',
    'Khu vực',
    'Mã cảm biến',
    'Cảm biến',
    'Loại cảm biến',
    'Thời gian ghi nhận',
    'Nhiệt độ (°C)',
    'Độ ẩm KQ (%)',
    'Độ ẩm đất (%)',
    'Ánh sáng (lux)',
  ];
  styleTableHeader(worksheet.getRow(headerRowNumber), columnCount);

  if (context.readings.length === 0) {
    applyEmptyState(worksheet, headerRowNumber + 1, columnCount, 'Không có dữ liệu cảm biến trong phạm vi đã chọn.');
    worksheet.autoFilter = `A${headerRowNumber}:${columnLetter(columnCount)}${headerRowNumber}`;
    return;
  }

  const rows = context.readings.map((reading, index) => [
    index + 1,
    reading.farmZone.name,
    reading.sensor.code,
    reading.sensor.name,
    reading.sensor.type,
    reading.recordedAt,
    reading.temperature,
    reading.airHumidity,
    reading.soilMoisture,
    reading.lightIntensity,
  ]);

  worksheet.addRows(rows);
  const lastRow = headerRowNumber + rows.length;
  styleDataRows(worksheet, headerRowNumber + 1, lastRow, columnCount);

  worksheet.getColumn(6).numFmt = 'dd/mm/yyyy hh:mm:ss';
  worksheet.getColumn(7).numFmt = '0.00';
  worksheet.getColumn(8).numFmt = '0.00';
  worksheet.getColumn(9).numFmt = '0.00';
  worksheet.getColumn(10).numFmt = '0.00';
  worksheet.autoFilter = `A${headerRowNumber}:${columnLetter(columnCount)}${lastRow}`;
}

function getSeverityFill(severity: string) {
  if (severity === 'CRITICAL') return COLORS.danger;
  if (severity === 'WARNING') return COLORS.warning;
  return COLORS.info;
}

function buildAlertsSheet(workbook: ExcelJS.Workbook, context: ReportContext) {
  const worksheet = workbook.addWorksheet('Cảnh báo', {
    views: [{ state: 'frozen', ySplit: 5, showGridLines: false }],
  });
  const columnCount = 9;
  const headerRowNumber = 5;

  worksheet.columns = [
    { width: 8 },
    { width: 24 },
    { width: 23 },
    { width: 22 },
    { width: 16 },
    { width: 18 },
    { width: 34 },
    { width: 52 },
    { width: 23 },
  ];

  applyTitle(worksheet, 'CẢNH BÁO', columnCount);
  applySubHeader(worksheet, context, columnCount);

  worksheet.getRow(headerRowNumber).values = [
    'STT',
    'Khu vực',
    'Thời gian tạo',
    'Loại',
    'Mức độ',
    'Trạng thái',
    'Tiêu đề',
    'Nội dung',
    'Thời gian xử lý',
  ];
  styleTableHeader(worksheet.getRow(headerRowNumber), columnCount);

  if (context.alerts.length === 0) {
    applyEmptyState(worksheet, headerRowNumber + 1, columnCount, 'Không có cảnh báo trong phạm vi đã chọn.');
    worksheet.autoFilter = `A${headerRowNumber}:${columnLetter(columnCount)}${headerRowNumber}`;
    return;
  }

  const rows = context.alerts.map((alert, index) => [
    index + 1,
    alert.farmZone.name,
    alert.createdAt,
    alert.type,
    alert.severity,
    alert.status,
    alert.title,
    alert.message,
    alert.resolvedAt,
  ]);

  worksheet.addRows(rows);
  const lastRow = headerRowNumber + rows.length;
  styleDataRows(worksheet, headerRowNumber + 1, lastRow, columnCount);

  for (let rowNumber = headerRowNumber + 1; rowNumber <= lastRow; rowNumber += 1) {
    const severityCell = worksheet.getCell(rowNumber, 5);
    severityCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: getSeverityFill(String(severityCell.value)) },
    };
    severityCell.font = { bold: true, color: { argb: 'FF111827' } };
  }

  worksheet.getColumn(3).numFmt = 'dd/mm/yyyy hh:mm:ss';
  worksheet.getColumn(8).alignment = { wrapText: true, vertical: 'top' };
  worksheet.getColumn(9).numFmt = 'dd/mm/yyyy hh:mm:ss';
  worksheet.autoFilter = `A${headerRowNumber}:${columnLetter(columnCount)}${lastRow}`;
}

export class ExportsService {
  static buildReportFilename = buildReportFilename;

  static async exportReadings(
    user: JwtPayload,
    farmZoneId?: string,
    from?: string,
    to?: string,
  ) {
    return this.exportSmartFarmReport(user, { farmZoneId, from, to });
  }

  static async exportAlerts(
    user: JwtPayload,
    from?: string,
    to?: string,
    farmZoneId?: string,
  ) {
    return this.exportSmartFarmReport(user, { farmZoneId, from, to });
  }

  private static async exportSmartFarmReport(user: JwtPayload, filters: ExportFilters) {
    const generatedAt = new Date();
    const [farmZones, exporterName] = await Promise.all([
      this.getAllowedFarmZones(user, filters.farmZoneId),
      this.getExporterName(user),
    ]);

    const farmZoneIds = farmZones.map((zone) => zone.id);
    const recordedAt = this.buildDateFilter(filters);
    const readingWhere: any = {
      farmZoneId: { in: farmZoneIds },
    };
    const alertWhere: any = {
      farmZoneId: { in: farmZoneIds },
    };

    if (recordedAt) {
      readingWhere.recordedAt = recordedAt;
      alertWhere.createdAt = recordedAt;
    }

    const [readings, alerts] = await Promise.all([
      prisma.sensorReading.findMany({
        where: readingWhere,
        include: {
          sensor: {
            select: {
              name: true,
              code: true,
              type: true,
            },
          },
          farmZone: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          recordedAt: 'desc',
        },
      }),
      prisma.alert.findMany({
        where: alertWhere,
        include: {
          farmZone: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = exporterName;
    workbook.created = generatedAt;
    workbook.modified = generatedAt;
    workbook.subject = 'Smart Farm report';
    workbook.title = 'Smart Farm report';

    const context: ReportContext = {
      exporterName,
      generatedAt,
      filters,
      farmZones,
      readings,
      alerts,
    };

    buildOverviewSheet(workbook, context);
    buildReadingsSheet(workbook, context);
    buildAlertsSheet(workbook, context);

    return workbook;
  }

  private static async getAllowedFarmZones(user: JwtPayload, farmZoneId?: string) {
    const scopedWhere = user.role === 'ADMIN' ? {} : { ownerId: user.id };

    if (farmZoneId) {
      const farmZone = await prisma.farmZone.findFirst({
        where: {
          id: farmZoneId,
          ...scopedWhere,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!farmZone) {
        throw new Error('Bạn không có quyền truy cập dữ liệu của khu vực này');
      }

      return [farmZone];
    }

    return prisma.farmZone.findMany({
      where: scopedWhere,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  private static async getExporterName(user: JwtPayload) {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
      },
    });

    return account?.name || account?.email || user.email || user.id;
  }

  private static buildDateFilter(filters: ExportFilters) {
    if (!filters.from && !filters.to) return undefined;

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (filters.from) dateFilter.gte = new Date(filters.from);
    if (filters.to) dateFilter.lte = new Date(filters.to);

    return dateFilter;
  }
}
