"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSensorReadingSchema = exports.getSensorReadingsSchema = void 0;
const zod_1 = require("zod");
exports.getSensorReadingsSchema = zod_1.z.object({
    query: zod_1.z.object({
        farmZoneId: zod_1.z.string().uuid('Invalid farmZoneId').optional(),
        sensorId: zod_1.z.string().uuid('Invalid sensorId').optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});
exports.createSensorReadingSchema = zod_1.z.object({
    body: zod_1.z.object({
        sensorId: zod_1.z.string().uuid('Invalid sensorId'),
        farmZoneId: zod_1.z.string().uuid('Invalid farmZoneId'),
        temperature: zod_1.z.number().optional(),
        airHumidity: zod_1.z.number().optional(),
        soilMoisture: zod_1.z.number().optional(),
        lightIntensity: zod_1.z.number().optional(),
    }),
});
