"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsController = void 0;
const exports_service_1 = require("./exports.service");
class ExportsController {
    static async exportReadings(req, res) {
        const user = req.user;
        const { farmZoneId, from, to } = req.query;
        const workbook = await exports_service_1.ExportsService.exportReadings(user, farmZoneId, from, to);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=readings.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
    static async exportAlerts(req, res) {
        const user = req.user;
        const { from, to } = req.query;
        const workbook = await exports_service_1.ExportsService.exportAlerts(user, from, to);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=alerts.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
}
exports.ExportsController = ExportsController;
