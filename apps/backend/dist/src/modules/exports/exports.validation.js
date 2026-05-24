"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReadingsSchema = exports.exportAlertsSchema = void 0;
const zod_1 = require("zod");
exports.exportAlertsSchema = zod_1.z.object({
    query: zod_1.z.object({
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }),
});
exports.exportReadingsSchema = zod_1.z.object({
    query: zod_1.z.object({
        farmZoneId: zod_1.z.string().uuid('farmZoneId không hợp lệ').optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }),
});
