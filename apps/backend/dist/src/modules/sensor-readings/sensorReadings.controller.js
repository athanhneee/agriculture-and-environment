"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorReadingController = void 0;
const sensorReadings_service_1 = require("./sensorReadings.service");
const apiResponse_1 = require("../../utils/apiResponse");
class SensorReadingController {
    static async getReadings(req, res) {
        const { farmZoneId, sensorId, from, to, page = '1', limit = '10' } = req.query;
        const result = await sensorReadings_service_1.SensorReadingService.getReadings({ farmZoneId, sensorId, from, to }, { page: parseInt(page, 10), limit: parseInt(limit, 10) });
        res.status(200).json(apiResponse_1.ApiResponse.success('Sensor readings retrieved successfully', result));
    }
    static async getLatestReadings(req, res) {
        const latest = await sensorReadings_service_1.SensorReadingService.getLatestReadings();
        res.status(200).json(apiResponse_1.ApiResponse.success('Latest sensor readings retrieved successfully', latest));
    }
    static async createReading(req, res) {
        const reading = await sensorReadings_service_1.SensorReadingService.createReading(req.body);
        res.status(201).json(apiResponse_1.ApiResponse.success('Sensor reading created successfully', reading));
    }
    static async deleteReading(req, res) {
        const { id } = req.params;
        await sensorReadings_service_1.SensorReadingService.deleteReading(id);
        res.status(200).json(apiResponse_1.ApiResponse.success('Sensor reading deleted successfully', null));
    }
}
exports.SensorReadingController = SensorReadingController;
