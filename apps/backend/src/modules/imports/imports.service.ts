import ExcelJS from "exceljs";
import prisma from "../../config/prisma";
import { JwtPayload } from "../../utils/jwt";
import { ZoneStatus } from "@prisma/client";

type ImportRow = {
  name: string;
  description?: string;
  area: number;
  latitude: number;
  longitude: number;
  soilType: string;
  status?: ZoneStatus;
};

const REQUIRED_HEADERS = ["name", "area", "latitude", "longitude", "soilType"];

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown, field: string) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Trường ${field} phải là số hợp lệ`);
  }

  return numberValue;
}

function validateRow(row: any, index: number): ImportRow {
  for (const header of REQUIRED_HEADERS) {
    if (row[header] === undefined || row[header] === null || row[header] === "") {
      throw new Error(`Dòng ${index}: thiếu cột bắt buộc "${header}"`);
    }
  }

  const latitude = parseNumber(row.latitude, "latitude");
  const longitude = parseNumber(row.longitude, "longitude");

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Dòng ${index}: latitude phải nằm trong [-90, 90]`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Dòng ${index}: longitude phải nằm trong [-180, 180]`);
  }

  const status = String(row.status || "ACTIVE").trim().toUpperCase();

  if (!["ACTIVE", "INACTIVE", "MAINTENANCE"].includes(status)) {
    throw new Error(
      `Dòng ${index}: status chỉ được là ACTIVE, INACTIVE hoặc MAINTENANCE`,
    );
  }

  return {
    name: String(row.name).trim(),
    description: row.description ? String(row.description).trim() : undefined,
    area: parseNumber(row.area, "area"),
    latitude,
    longitude,
    soilType: String(row.soilType).trim(),
    status: status as ZoneStatus,
  };
}

async function parseExcel(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("File Excel không có sheet dữ liệu");
  }

  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values as unknown[];

  const headerMap = new Map<number, string>();

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (normalized) headerMap.set(index, normalized);
  });

  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const obj: any = {};

    headerMap.forEach((header, columnIndex) => {
      obj[header] = row.getCell(columnIndex).value;
    });

    if (Object.values(obj).some((value) => value !== null && value !== "")) {
      rows.push(obj);
    }
  });

  return rows;
}

function detectDelimiter(line: string) {
  if (line.includes("\t")) return "\t";
  if (line.includes(";")) return ";";
  return ",";
}

function parseTextTable(buffer: Buffer) {
  const content = buffer.toString("utf8").replace(/^\uFEFF/, "");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("File CSV/TXT phải có dòng header và ít nhất 1 dòng dữ liệu");
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((value) => value.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    return row;
  });
}

export class ImportsService {
  static async importFarmZones(file: Express.Multer.File, user: JwtPayload) {
    if (user.role !== "ADMIN") {
      throw { statusCode: 403, message: "Chỉ ADMIN được import vùng trồng" };
    }

    const filename = file.originalname.toLowerCase();

    let rawRows: any[] = [];

    if (filename.endsWith(".xlsx")) {
      rawRows = await parseExcel(file.buffer);
    } else if (filename.endsWith(".csv") || filename.endsWith(".txt")) {
      rawRows = parseTextTable(file.buffer);
    } else {
      throw new Error("Chỉ hỗ trợ file .xlsx, .csv hoặc .txt");
    }

    const validatedRows = rawRows.map((row, index) => validateRow(row, index + 2));

    const created = await prisma.$transaction(
      validatedRows.map((row) =>
        prisma.farmZone.create({
          data: {
            ...row,
            ownerId: user.id,
          },
        }),
      ),
    );

    return {
      imported: created.length,
      rows: created,
    };
  }
}
