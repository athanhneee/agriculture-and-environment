"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorController = void 0;
const sensors_service_1 = require("./sensors.service");
const apiResponse_1 = require("../../utils/apiResponse");
const sensors_validation_1 = require("./sensors.validation");
class SensorController {
    static async getSensors(req, res) {
        const result = await sensors_service_1.SensorService.getSensors(req.query, req.user);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy danh sách cảm biến thành công', result));
    }
    static async getSensorById(req, res) {
        try {
            const result = await sensors_service_1.SensorService.getSensorById(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thông tin cảm biến thành công', result));
        }
        catch (error) {
            res.status(404).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async createSensor(req, res) {
        try {
            const validatedData = sensors_validation_1.createSensorSchema.parse(req.body);
            const result = await sensors_service_1.SensorService.createSensor(validatedData, req.user);
            res.status(201).json(apiResponse_1.ApiResponse.success('Tạo cảm biến thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async updateSensor(req, res) {
        try {
            const validatedData = sensors_validation_1.updateSensorSchema.parse(req.body);
            const result = await sensors_service_1.SensorService.updateSensor(req.params.id, validatedData, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Cập nhật cảm biến thành công', result));
        }
        catch (error) {
            if (error.errors) {
                return res.status(400).json(apiResponse_1.ApiResponse.error('Lỗi validation', error.errors));
            }
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
    static async deleteSensor(req, res) {
        try {
            await sensors_service_1.SensorService.deleteSensor(req.params.id, req.user);
            res.status(200).json(apiResponse_1.ApiResponse.success('Xóa cảm biến thành công'));
        }
        catch (error) {
            res.status(400).json(apiResponse_1.ApiResponse.error(error.message));
        }
    }
}
exports.SensorController = SensorController;
