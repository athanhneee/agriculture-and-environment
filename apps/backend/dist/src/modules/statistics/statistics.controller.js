"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsController = void 0;
const statistics_service_1 = require("./statistics.service");
const apiResponse_1 = require("../../utils/apiResponse");
class StatisticsController {
    static async getOverview(req, res) {
        const user = req.user;
        const overview = await statistics_service_1.StatisticsService.getOverview(user);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thống kê tổng quan thành công', overview));
    }
    static async getAlerts(req, res) {
        const user = req.user;
        const { from, to } = req.query;
        const stats = await statistics_service_1.StatisticsService.getAlertStats(user, from, to);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thống kê cảnh báo thành công', stats));
    }
    static async getReadings(req, res) {
        const user = req.user;
        const { farmZoneId, from, to } = req.query;
        const stats = await statistics_service_1.StatisticsService.getReadingStats(user, farmZoneId, from, to);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy thống kê cảm biến thành công', stats));
    }
}
exports.StatisticsController = StatisticsController;
