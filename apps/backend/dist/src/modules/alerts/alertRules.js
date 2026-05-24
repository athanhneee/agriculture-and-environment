"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateReadingForAlerts = void 0;
const thresholds_1 = require("../../constants/thresholds");
const evaluateReadingForAlerts = (reading) => {
    const alerts = [];
    const t = thresholds_1.ALERT_THRESHOLDS;
    // Temperature
    if (reading.temperature !== undefined && reading.temperature !== null) {
        if (reading.temperature > t.TEMPERATURE.CRITICAL_HIGH) {
            alerts.push({
                type: 'HIGH_TEMPERATURE',
                severity: 'CRITICAL',
                title: 'Nhiệt độ cực kỳ cao',
                message: `Nhiệt độ hiện tại đạt ${reading.temperature}°C, vượt mức nguy hiểm (> ${t.TEMPERATURE.CRITICAL_HIGH}°C)`,
            });
        }
        else if (reading.temperature > t.TEMPERATURE.WARNING_HIGH) {
            alerts.push({
                type: 'HIGH_TEMPERATURE',
                severity: 'WARNING',
                title: 'Nhiệt độ tăng cao',
                message: `Nhiệt độ hiện tại đạt ${reading.temperature}°C, vượt ngưỡng cảnh báo (> ${t.TEMPERATURE.WARNING_HIGH}°C)`,
            });
        }
    }
    // Soil Moisture
    if (reading.soilMoisture !== undefined && reading.soilMoisture !== null) {
        if (reading.soilMoisture < t.SOIL_MOISTURE.CRITICAL_LOW) {
            alerts.push({
                type: 'LOW_SOIL_MOISTURE',
                severity: 'CRITICAL',
                title: 'Đất quá khô',
                message: `Độ ẩm đất giảm xuống ${reading.soilMoisture}%, dưới mức nguy hiểm (< ${t.SOIL_MOISTURE.CRITICAL_LOW}%)`,
            });
        }
        else if (reading.soilMoisture < t.SOIL_MOISTURE.WARNING_LOW) {
            alerts.push({
                type: 'LOW_SOIL_MOISTURE',
                severity: 'WARNING',
                title: 'Đất khô',
                message: `Độ ẩm đất giảm xuống ${reading.soilMoisture}%, dưới ngưỡng cảnh báo (< ${t.SOIL_MOISTURE.WARNING_LOW}%)`,
            });
        }
    }
    // Air Humidity
    if (reading.airHumidity !== undefined && reading.airHumidity !== null) {
        if (reading.airHumidity > t.AIR_HUMIDITY.WARNING_HIGH) {
            alerts.push({
                type: 'HIGH_HUMIDITY',
                severity: 'WARNING',
                title: 'Độ ẩm không khí cao',
                message: `Độ ẩm không khí đạt ${reading.airHumidity}%, vượt ngưỡng cảnh báo (> ${t.AIR_HUMIDITY.WARNING_HIGH}%)`,
            });
        }
    }
    // Light
    if (reading.lightIntensity !== undefined && reading.lightIntensity !== null) {
        if (reading.lightIntensity < t.LIGHT_INTENSITY.WARNING_LOW) {
            alerts.push({
                type: 'LOW_LIGHT',
                severity: 'WARNING',
                title: 'Thiếu ánh sáng',
                message: `Cường độ ánh sáng đạt ${reading.lightIntensity} Lux, dưới mức cần thiết (< ${t.LIGHT_INTENSITY.WARNING_LOW} Lux)`,
            });
        }
    }
    // Pest Risk
    if (reading.temperature !== undefined && reading.temperature !== null &&
        reading.airHumidity !== undefined && reading.airHumidity !== null) {
        if (reading.temperature > t.PEST_RISK.TEMP_THRESHOLD &&
            reading.airHumidity > t.PEST_RISK.HUMIDITY_THRESHOLD) {
            alerts.push({
                type: 'PEST_RISK',
                severity: 'WARNING',
                title: 'Nguy cơ sâu bệnh cao',
                message: `Kết hợp nhiệt độ ${reading.temperature}°C và độ ẩm ${reading.airHumidity}% tạo điều kiện thuận lợi cho sâu bệnh phát triển`,
            });
        }
    }
    return alerts;
};
exports.evaluateReadingForAlerts = evaluateReadingForAlerts;
