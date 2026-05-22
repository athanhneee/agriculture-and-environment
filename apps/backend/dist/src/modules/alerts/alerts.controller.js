"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
const alerts_service_1 = require("./alerts.service");
const apiResponse_1 = require("../../utils/apiResponse");
class AlertController {
    static async getAlerts(req, res) {
        const { farmZoneId, status, severity, type, from, to, page = '1', limit = '10' } = req.query;
        const result = await alerts_service_1.AlertService.getAlerts({ farmZoneId, status, severity, type, from, to }, { page: parseInt(page, 10), limit: parseInt(limit, 10) });
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy danh sách cảnh báo thành công', result));
    }
    static async getAlertById(req, res) {
        const alert = await alerts_service_1.AlertService.getAlertById(req.params.id);
        res.status(200).json(apiResponse_1.ApiResponse.success('Lấy chi tiết cảnh báo thành công', alert));
    }
    static async acknowledgeAlert(req, res) {
        const alert = await alerts_service_1.AlertService.acknowledgeAlert(req.params.id);
        res.status(200).json(apiResponse_1.ApiResponse.success('Đã xác nhận cảnh báo', alert));
    }
    static async resolveAlert(req, res) {
        const alert = await alerts_service_1.AlertService.resolveAlert(req.params.id);
        res.status(200).json(apiResponse_1.ApiResponse.success('Đã xử lý cảnh báo', alert));
    }
    static async deleteAlert(req, res) {
        await alerts_service_1.AlertService.deleteAlert(req.params.id);
        res.status(200).json(apiResponse_1.ApiResponse.success('Đã xóa cảnh báo', null));
    }
}
exports.AlertController = AlertController;
