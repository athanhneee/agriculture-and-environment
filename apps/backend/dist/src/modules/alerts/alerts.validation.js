"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertsSchema = void 0;
const zod_1 = require("zod");
exports.getAlertsSchema = zod_1.z.object({
    query: zod_1.z.object({
        farmZoneId: zod_1.z.string().uuid('Invalid farmZoneId').optional(),
        status: zod_1.z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']).optional(),
        severity: zod_1.z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
        type: zod_1.z.enum([
            'CRITICAL_WEATHER', 'SOIL_DRY', 'SENSOR_MALFUNCTION', 'OVERHEATING',
            'HIGH_TEMPERATURE', 'LOW_SOIL_MOISTURE', 'HIGH_HUMIDITY', 'LOW_LIGHT', 'PEST_RISK'
        ]).optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});
