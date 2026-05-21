"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmZoneController = void 0;
const farm_zones_service_1 = require("./farm-zones.service");
const apiResponse_1 = require("../../utils/apiResponse");
const farm_zones_validation_1 = require("./farm-zones.validation");
class FarmZoneController {
    static async getFarmZones(req, res) {
        const result = await farm_zones_service_1.FarmZoneService.getFarmZones(req.query, req.user);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy danh sách vùng canh tác thành công', result));
    }
    static async getFarmZoneById(req, res) {
        try {
            const result = await farm_zones_service_1.FarmZoneService.getFarmZoneById(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thông tin vùng canh tác thành công', result));
        }
        catch (error) {
            res.status(404).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async createFarmZone(req, res) {
        try {
            const validatedData = farm_zones_validation_1.createFarmZoneSchema.parse(req.body);
            const result = await farm_zones_service_1.FarmZoneService.createFarmZone(validatedData, req.user);
            res.status(201).json(apiResponse_1.ApiResponse.success('Tạo vùng canh tác thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async updateFarmZone(req, res) {
        try {
            const validatedData = farm_zones_validation_1.updateFarmZoneSchema.parse(req.body);
            const result = await farm_zones_service_1.FarmZoneService.updateFarmZone(req.params.id, validatedData, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Cập nhật vùng canh tác thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async deleteFarmZone(req, res) {
        try {
            await farm_zones_service_1.FarmZoneService.deleteFarmZone(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Xóa vùng canh tác thành công'));
        }
        catch (error) {
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
}
exports.FarmZoneController = FarmZoneController;
