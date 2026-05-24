"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alertRules_1 = require("../modules/alerts/alertRules");
const thresholds_1 = require("../constants/thresholds");
describe('Alert Rules Evaluation', () => {
    it('should generate HIGH_TEMPERATURE alert when temperature exceeds critical threshold', () => {
        const alerts = (0, alertRules_1.evaluateReadingForAlerts)({
            temperature: thresholds_1.ALERT_THRESHOLDS.TEMPERATURE.CRITICAL_HIGH + 1,
        });
        expect(alerts).toHaveLength(1);
        expect(alerts[0].type).toBe('HIGH_TEMPERATURE');
        expect(alerts[0].severity).toBe('CRITICAL');
    });
    it('should generate LOW_SOIL_MOISTURE alert when soil moisture is below critical threshold', () => {
        const alerts = (0, alertRules_1.evaluateReadingForAlerts)({
            soilMoisture: thresholds_1.ALERT_THRESHOLDS.SOIL_MOISTURE.CRITICAL_LOW - 1,
        });
        expect(alerts).toHaveLength(1);
        expect(alerts[0].type).toBe('LOW_SOIL_MOISTURE');
        expect(alerts[0].severity).toBe('CRITICAL');
    });
    it('should not generate any alerts for normal readings', () => {
        const alerts = (0, alertRules_1.evaluateReadingForAlerts)({
            temperature: 25,
            airHumidity: 50,
            soilMoisture: 60,
            lightIntensity: 5000,
        });
        expect(alerts).toHaveLength(0);
    });
});
