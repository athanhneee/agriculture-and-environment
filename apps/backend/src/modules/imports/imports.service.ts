import ExcelJS from "exceljs";
import prisma from "../../config/prisma";
import { JwtPayload } from "../../utils/jwt";
import { ZoneStatus, CropStatus, SensorType, SensorStatus, Role, UserStatus } from "@prisma/client";
import { PasswordUtil } from "../../utils/password";

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

function parseDate(value: any, field: string): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) throw new Error(`Trường ${field} phải là ngày tháng hợp lệ`);
    return value;
  }
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) throw new Error(`Trường ${field} phải là ngày tháng hợp lệ (VD: YYYY-MM-DD)`);
  return parsed;
}

type ImportCropRow = {
  name: string;
  variety: string;
  plantedDate: Date;
  expectedHarvestDate?: Date;
  status: CropStatus;
  farmZoneName: string;
};

const REQUIRED_CROP_HEADERS = ["name", "variety", "plantedDate", "status", "farmZoneName"];

function validateCropRow(row: any, index: number): ImportCropRow {
  for (const header of REQUIRED_CROP_HEADERS) {
    if (row[header] === undefined || row[header] === null || row[header] === "") {
      throw new Error(`Dòng ${index}: thiếu cột bắt buộc "${header}"`);
    }
  }

  const status = String(row.status || "PLANTED").trim().toUpperCase();

  if (!["PLANTED", "GROWING", "HARVESTED", "DISEASED"].includes(status)) {
    throw new Error(
      `Dòng ${index}: status chỉ được là PLANTED, GROWING, HARVESTED, hoặc DISEASED`,
    );
  }

  return {
    name: String(row.name).trim(),
    variety: String(row.variety).trim(),
    plantedDate: parseDate(row.plantedDate, "plantedDate"),
    expectedHarvestDate: row.expectedHarvestDate ? parseDate(row.expectedHarvestDate, "expectedHarvestDate") : undefined,
    status: status as CropStatus,
    farmZoneName: String(row.farmZoneName).trim(),
  };
}

type ImportSensorRow = {
  name: string;
  code: string;
  type: SensorType;
  unit: string;
  status: SensorStatus;
  farmZoneName: string;
};

const REQUIRED_SENSOR_HEADERS = ["name", "code", "type", "unit", "farmZoneName"];

function validateSensorRow(row: any, index: number): ImportSensorRow {
  for (const header of REQUIRED_SENSOR_HEADERS) {
    if (row[header] === undefined || row[header] === null || row[header] === "") {
      throw new Error(`Dòng ${index}: thiếu cột bắt buộc "${header}"`);
    }
  }

  const typeStr = String(row.type).trim().toUpperCase();
  const validTypes = ["TEMPERATURE", "AIR_HUMIDITY", "SOIL_MOISTURE", "LIGHT_INTENSITY", "ALL_IN_ONE"];
  if (!validTypes.includes(typeStr)) {
    throw new Error(`Dòng ${index}: loại cảm biến (type) không hợp lệ`);
  }

  const statusStr = String(row.status || "ACTIVE").trim().toUpperCase();
  if (!["ACTIVE", "INACTIVE", "ERROR"].includes(statusStr)) {
    throw new Error(`Dòng ${index}: trạng thái (status) không hợp lệ`);
  }

  return {
    name: String(row.name).trim(),
    code: String(row.code).trim(),
    type: typeStr as SensorType,
    unit: String(row.unit).trim(),
    status: statusStr as SensorStatus,
    farmZoneName: String(row.farmZoneName).trim(),
  };
}

type ImportUserRow = {
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: UserStatus;
};

const REQUIRED_USER_HEADERS = ["name", "email"];

function validateUserRow(row: any, index: number): ImportUserRow {
  for (const header of REQUIRED_USER_HEADERS) {
    if (row[header] === undefined || row[header] === null || row[header] === "") {
      throw new Error(`Dòng ${index}: thiếu cột bắt buộc "${header}"`);
    }
  }

  const roleStr = String(row.role || "USER").trim().toUpperCase();
  if (!["ADMIN", "USER"].includes(roleStr)) {
    throw new Error(`Dòng ${index}: quyền (role) chỉ được là ADMIN hoặc USER`);
  }

  const statusStr = String(row.status || "ACTIVE").trim().toUpperCase();
  if (!["ACTIVE", "INACTIVE"].includes(statusStr)) {
    throw new Error(`Dòng ${index}: trạng thái (status) chỉ được là ACTIVE hoặc INACTIVE`);
  }

  return {
    name: String(row.name).trim(),
    email: String(row.email).trim().toLowerCase(),
    password: row.password ? String(row.password).trim() : undefined,
    role: roleStr as Role,
    status: statusStr as UserStatus,
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
    if (user.role === "ADMIN") {
      throw new Error("Quản trị viên không có quyền import vùng trồng.");
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

    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2; // dòng 1 là header, dữ liệu bắt đầu từ dòng 2
      try {
        const validated = validateRow(rawRows[i], rowNumber);

        // Kiểm tra trùng tên vùng trồng
        const existingName = await prisma.farmZone.findFirst({
          where: { ownerId: user.id, name: validated.name }
        });

        if (existingName) {
          throw new Error(`Tên vùng trồng "${validated.name}" đã tồn tại`);
        }

        // Kiểm tra trùng vị trí
        const existingLocation = await prisma.farmZone.findFirst({
          where: { latitude: validated.latitude, longitude: validated.longitude }
        });

        if (existingLocation) {
          throw new Error(`Vị trí (vĩ độ: ${validated.latitude}, kinh độ: ${validated.longitude}) đã được đăng ký cho vùng trồng khác trong hệ thống`);
        }

        await prisma.farmZone.create({
          data: { ...validated, ownerId: user.id },
        });
        imported++;
        console.log(`[Import] ✅ Dòng ${rowNumber}: "${validated.name}" — lưu thành công`);
      } catch (err: any) {
        const message: string = err?.message ?? "Lỗi không xác định";
        errors.push({ row: rowNumber, message });
        console.warn(`[Import] ❌ Dòng ${rowNumber}: ${message}`);
      }
    }

    console.log(
      `[Import] Hoàn tất — Thành công: ${imported}/${rawRows.length} | Lỗi: ${errors.length}`,
    );

    return { imported, skipped: errors.length, errors };
  }

  static async importCrops(file: Express.Multer.File, user: JwtPayload) {
    if (user.role === "ADMIN") {
      throw new Error("Quản trị viên không có quyền import cây trồng.");
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

    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2; // dòng 1 là header, dữ liệu bắt đầu từ dòng 2
      try {
        const validated = validateCropRow(rawRows[i], rowNumber);

        // Tìm vùng trồng theo tên (và thuộc về user nếu không phải admin)
        // Lưu ý: Tên vùng trồng có thể bị trùng nếu có nhiều vùng trồng cùng tên?
        // Không, schema có @@unique([ownerId, name])

        const farmZone = await prisma.farmZone.findUnique({
          where: { ownerId_name: { ownerId: user.id, name: validated.farmZoneName } },
        });

        if (!farmZone) {
          throw new Error(`Không tìm thấy vùng trồng "${validated.farmZoneName}" của bạn`);
        }

        await prisma.crop.create({
          data: {
            name: validated.name,
            variety: validated.variety,
            plantedDate: validated.plantedDate,
            expectedHarvestDate: validated.expectedHarvestDate,
            status: validated.status,
            farmZoneId: farmZone.id,
          },
        });
        imported++;
        console.log(`[Import Crops] ✅ Dòng ${rowNumber}: "${validated.name}" — lưu thành công`);
      } catch (err: any) {
        const message: string = err?.message ?? "Lỗi không xác định";
        errors.push({ row: rowNumber, message });
        console.warn(`[Import Crops] ❌ Dòng ${rowNumber}: ${message}`);
      }
    }

    console.log(
      `[Import Crops] Hoàn tất — Thành công: ${imported}/${rawRows.length} | Lỗi: ${errors.length}`,
    );

    return { imported, skipped: errors.length, errors };
  }

  static async importSensors(file: Express.Multer.File, user: JwtPayload) {
    if (user.role === "ADMIN") {
      throw new Error("Quản trị viên không có quyền import cảm biến.");
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

    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2; 
      try {
        const validated = validateSensorRow(rawRows[i], rowNumber);

        // Kiểm tra vùng trồng
        const farmZone = await prisma.farmZone.findUnique({
          where: { ownerId_name: { ownerId: user.id, name: validated.farmZoneName } },
        });

        if (!farmZone) {
          throw new Error(`Không tìm thấy vùng trồng "${validated.farmZoneName}" của bạn`);
        }

        // Kiểm tra trùng mã code trên toàn hệ thống
        const existingCode = await prisma.sensor.findUnique({
          where: { code: validated.code }
        });

        if (existingCode) {
          throw new Error(`Mã thiết bị "${validated.code}" đã tồn tại trong hệ thống`);
        }

        await prisma.sensor.create({
          data: {
            name: validated.name,
            code: validated.code,
            type: validated.type,
            unit: validated.unit,
            status: validated.status,
            farmZoneId: farmZone.id,
          },
        });
        imported++;
        console.log(`[Import Sensors] ✅ Dòng ${rowNumber}: "${validated.name}" — lưu thành công`);
      } catch (err: any) {
        const message: string = err?.message ?? "Lỗi không xác định";
        errors.push({ row: rowNumber, message });
        console.warn(`[Import Sensors] ❌ Dòng ${rowNumber}: ${message}`);
      }
    }

    console.log(
      `[Import Sensors] Hoàn tất — Thành công: ${imported}/${rawRows.length} | Lỗi: ${errors.length}`,
    );

    return { imported, skipped: errors.length, errors };
  }

  static async importUsers(file: Express.Multer.File, user: JwtPayload) {
    if (user.role !== "ADMIN") {
      throw new Error("Chỉ quản trị viên mới có quyền import người dùng.");
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

    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2; 
      try {
        const validated = validateUserRow(rawRows[i], rowNumber);

        const existingEmail = await prisma.user.findUnique({
          where: { email: validated.email }
        });

        if (existingEmail) {
          throw new Error(`Email "${validated.email}" đã tồn tại trong hệ thống`);
        }

        const defaultPassword = validated.password || 'SmartFarm@123';
        const passwordHash = await PasswordUtil.hash(defaultPassword);

        await prisma.user.create({
          data: {
            name: validated.name,
            email: validated.email,
            passwordHash,
            role: validated.role,
            status: validated.status,
          },
        });
        
        imported++;
        console.log(`[Import Users] ✅ Dòng ${rowNumber}: "${validated.email}" — lưu thành công`);
      } catch (err: any) {
        const message: string = err?.message ?? "Lỗi không xác định";
        errors.push({ row: rowNumber, message });
        console.warn(`[Import Users] ❌ Dòng ${rowNumber}: ${message}`);
      }
    }

    console.log(
      `[Import Users] Hoàn tất — Thành công: ${imported}/${rawRows.length} | Lỗi: ${errors.length}`,
    );

    return { imported, skipped: errors.length, errors };
  }
}

