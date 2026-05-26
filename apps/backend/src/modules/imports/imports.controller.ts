import { Request, Response } from "express";
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
}
