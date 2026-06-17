import { Request, Response } from "express";
import ExcelJS from "exceljs";
import { ImportsService } from "./imports.service";
import { ApiResponse } from "../../utils/apiResponse";

export class ImportsController {
  static async importFarmZones(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("Vui lòng upload file"));
    }

    const result = await ImportsService.importFarmZones(req.file, req.user!);

    return res
      .status(201)
      .json(ApiResponse.success("Import vùng trồng thành công", result));
  }

  static async downloadTemplate(_req: Request, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("farm_zones_template");

    // Định nghĩa cột với header và width
    sheet.columns = [
      { header: "name", key: "name", width: 28 },
      { header: "description", key: "description", width: 36 },
      { header: "area", key: "area", width: 14 },
      { header: "gpsCoordinates", key: "gpsCoordinates", width: 28 },
      { header: "soilType", key: "soilType", width: 22 },
      { header: "status", key: "status", width: 16 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" }, // emerald-600
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF15803D" } },
      };
    });
    headerRow.height = 22;

    // Thêm 10 dòng dữ liệu mẫu
    const sampleRows = [
      {
        name: "Vùng trồng A - Khu Bắc",
        description: "Khu vực trồng lúa chính vụ Đông Xuân",
        area: 2.5,
        gpsCoordinates: "10.7626, 106.6602",
        soilType: "Đất đỏ Bazan",
        status: "ACTIVE",
      },
      {
        name: "Vùng trồng B - Khu Nam",
        description: "Khu thử nghiệm rau màu hữu cơ",
        area: 1.0,
        gpsCoordinates: "10.7750, 106.7000",
        soilType: "Đất phù sa",
        status: "INACTIVE",
      },
      {
        name: "Khu C - Cà phê Tây Nguyên",
        description: "Trồng cà phê Arabica xuất khẩu",
        area: 5.2,
        gpsCoordinates: "12.6667, 108.0500",
        soilType: "Đất đỏ Bazan",
        status: "ACTIVE",
      },
      {
        name: "Khu D - Hồ tiêu Gia Lai",
        description: "Vùng tiêu đen chứng nhận GlobalG.A.P",
        area: 3.8,
        gpsCoordinates: "13.9833, 108.0000",
        soilType: "Đất feralit đỏ vàng",
        status: "ACTIVE",
      },
      {
        name: "Khu E - Cao su Bình Phước",
        description: "Vườn cao su tiểu điền 8 năm tuổi",
        area: 10.0,
        gpsCoordinates: "11.7500, 106.9167",
        soilType: "Đất xám bạc màu",
        status: "MAINTENANCE",
      },
      {
        name: "Khu F - Điều Đồng Nai",
        description: "Trồng điều ghép giống cao sản",
        area: 4.5,
        gpsCoordinates: "11.0686, 107.1676",
        soilType: "Đất cát pha",
        status: "ACTIVE",
      },
      {
        name: "Khu G - Mía Tây Ninh",
        description: "Vùng nguyên liệu mía cho nhà máy đường",
        area: 8.0,
        gpsCoordinates: "11.3500, 106.1000",
        soilType: "Đất phù sa cổ",
        status: "ACTIVE",
      },
      {
        name: "Khu H - Thanh long Bình Thuận",
        description: "Thanh long ruột đỏ xuất khẩu châu Âu",
        area: 2.0,
        gpsCoordinates: "10.9333, 108.1000",
        soilType: "Đất cát",
        status: "ACTIVE",
      },
      {
        name: "Khu I - Xoài Đồng Tháp",
        description: "Xoài cát Hòa Lộc VietGAP",
        area: 1.8,
        gpsCoordinates: "10.4667, 105.6333",
        soilType: "Đất phù sa ngọt",
        status: "INACTIVE",
      },
      {
        name: "Khu J - Sầu riêng Tiền Giang",
        description: "Sầu riêng Ri6 và Monthong xuất khẩu",
        area: 3.0,
        gpsCoordinates: "10.3600, 106.3600",
        soilType: "Đất thịt pha sét",
        status: "ACTIVE",
      },
    ];


    sampleRows.forEach((row, i) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFF0FDF4" : "FFFFFFFF" },
        };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="farm_zones_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
  static async importCrops(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("Vui lòng upload file"));
    }

    const result = await ImportsService.importCrops(req.file, req.user!);

    return res
      .status(201)
      .json(ApiResponse.success("Import cây trồng thành công", result));
  }

  static async downloadCropsTemplate(_req: Request, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("crops_template");

    // Định nghĩa cột với header và width
    sheet.columns = [
      { header: "name", key: "name", width: 28 },
      { header: "variety", key: "variety", width: 28 },
      { header: "plantedDate", key: "plantedDate", width: 16 },
      { header: "expectedHarvestDate", key: "expectedHarvestDate", width: 22 },
      { header: "status", key: "status", width: 16 },
      { header: "farmZoneName", key: "farmZoneName", width: 28 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" }, // emerald-600
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF15803D" } },
      };
    });
    headerRow.height = 22;

    // Thêm dòng dữ liệu mẫu
    const sampleRows = [
      {
        name: "Cà chua Cherry",
        variety: "F1 Nhật Bản",
        plantedDate: "2024-03-01",
        expectedHarvestDate: "2024-05-15",
        status: "GROWING",
        farmZoneName: "Vùng trồng A - Khu Bắc",
      },
      {
        name: "Dưa lưới Mật",
        variety: "Hoàng kim",
        plantedDate: "2024-04-10",
        expectedHarvestDate: "2024-07-20",
        status: "PLANTED",
        farmZoneName: "Vùng trồng B - Khu Nam",
      },
      {
        name: "Bắp cải tím",
        variety: "Ruby Perfection",
        plantedDate: "2024-01-15",
        expectedHarvestDate: "2024-04-05",
        status: "HARVESTED",
        farmZoneName: "Khu C - Cà phê Tây Nguyên",
      },
    ];

    sampleRows.forEach((row, i) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFF0FDF4" : "FFFFFFFF" },
        };
      });
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="crops_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  static async importSensors(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("Vui lòng upload file"));
    }

    const result = await ImportsService.importSensors(req.file, req.user!);

    return res
      .status(201)
      .json(ApiResponse.success("Import cảm biến thành công", result));
  }

  static async downloadSensorsTemplate(_req: Request, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("sensors_template");

    sheet.columns = [
      { header: "name", key: "name", width: 28 },
      { header: "code", key: "code", width: 22 },
      { header: "type", key: "type", width: 22 },
      { header: "unit", key: "unit", width: 14 },
      { header: "status", key: "status", width: 16 },
      { header: "farmZoneName", key: "farmZoneName", width: 28 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" }, 
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF15803D" } },
      };
    });
    headerRow.height = 22;

    const sampleRows = [
      {
        name: "Cảm biến Nhiệt độ 1",
        code: "SN-TEMP-001",
        type: "TEMPERATURE",
        unit: "°C",
        status: "ACTIVE",
        farmZoneName: "Vùng trồng A - Khu Bắc",
      },
      {
        name: "Cảm biến Độ ẩm đất 1",
        code: "SN-SOIL-001",
        type: "SOIL_MOISTURE",
        unit: "%",
        status: "ACTIVE",
        farmZoneName: "Vùng trồng B - Khu Nam",
      },
      {
        name: "Trạm tích hợp A",
        code: "SN-ALL-001",
        type: "ALL_IN_ONE",
        unit: "Multi",
        status: "INACTIVE",
        farmZoneName: "Khu C - Cà phê Tây Nguyên",
      },
    ];

    sampleRows.forEach((row, i) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFF0FDF4" : "FFFFFFFF" },
        };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sensors_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  static async importUsers(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("Vui lòng upload file"));
    }

    const result = await ImportsService.importUsers(req.file, req.user!);

    return res
      .status(201)
      .json(ApiResponse.success("Import người dùng thành công", result));
  }

  static async downloadUsersTemplate(_req: Request, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("users_template");

    sheet.columns = [
      { header: "name", key: "name", width: 28 },
      { header: "email", key: "email", width: 35 },
      { header: "password", key: "password", width: 20 },
      { header: "role", key: "role", width: 16 },
      { header: "status", key: "status", width: 16 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" }, 
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF15803D" } },
      };
    });
    headerRow.height = 22;

    const sampleRows = [
      {
        name: "Lê Văn Bảy",
        email: "levanbay@gmail.com",
        password: "Password123",
        role: "USER",
        status: "ACTIVE",
      },
      {
        name: "Nguyễn Thị Chín",
        email: "nguyenthichin@gmail.com",
        password: "",
        role: "USER",
        status: "INACTIVE",
      },
      {
        name: "Trần Quản Trị",
        email: "tranquan@gmail.com",
        password: "Admin@123",
        role: "ADMIN",
        status: "ACTIVE",
      },
    ];

    sampleRows.forEach((row, i) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFF0FDF4" : "FFFFFFFF" },
        };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
