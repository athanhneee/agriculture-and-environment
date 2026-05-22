"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CropController = void 0;
const crops_service_1 = require("./crops.service");
const apiResponse_1 = require("../../utils/apiResponse");
const crops_validation_1 = require("./crops.validation");
class CropController {
    static async getCrops(req, res) {
        const result = await crops_service_1.CropService.getCrops(req.query, req.user);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy danh sách cây trồng thành công', result));
    }
    static async getCropById(req, res) {
        try {
            const result = await crops_service_1.CropService.getCropById(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thông tin cây trồng thành công', result));
        }
        catch (error) {
            res.status(404).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async createCrop(req, res) {
        try {
            const validatedData = crops_validation_1.createCropSchema.parse(req.body);
            const result = await crops_service_1.CropService.createCrop(validatedData, req.user);
            res.status(201).json(apiResponse_1.ApiResponse.success('Tạo cây trồng thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async updateCrop(req, res) {
        try {
            const validatedData = crops_validation_1.updateCropSchema.parse(req.body);
            const result = await crops_service_1.CropService.updateCrop(req.params.id, validatedData, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Cập nhật cây trồng thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async deleteCrop(req, res) {
        try {
            await crops_service_1.CropService.deleteCrop(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Xóa cây trồng thành công'));
        }
        catch (error) {
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
}
exports.CropController = CropController;
