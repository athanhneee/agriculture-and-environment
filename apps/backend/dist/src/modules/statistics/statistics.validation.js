"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadingStatsSchema = exports.getAlertStatsSchema = void 0;
const zod_1 = require("zod");
exports.getAlertStatsSchema = zod_1.z.object({
    query: zod_1.z.object({
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }),
});
exports.getReadingStatsSchema = zod_1.z.object({
    query: zod_1.z.object({
        farmZoneId: zod_1.z.string().uuid('farmZoneId không hợp lệ').optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }),
});
