"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const cors_2 = require("./config/cors");
const error_middleware_1 = require("./middlewares/error.middleware");
const apiResponse_1 = require("./utils/apiResponse");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const farm_zones_routes_1 = __importDefault(require("./modules/farm-zones/farm-zones.routes"));
const crops_routes_1 = __importDefault(require("./modules/crops/crops.routes"));
const sensors_routes_1 = __importDefault(require("./modules/sensors/sensors.routes"));
const app = (0, express_1.default)();
// --- 1. Global Middlewares ---
app.use((0, helmet_1.default)()); // Bảo mật HTTP headers
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)(env_1.env.isDev ? 'dev' : 'combined')); // Log request
// --- 2. Routes ---
// Endpoint Health Check theo yêu cầu
app.get('/api/health', (req, res) => {
    const healthData = {
        status: 'Backend is running smoothly 🚀',
        timestamp: new Date().toISOString(),
        environment: env_1.env.nodeEnv,
    };
    res.status(200).json(apiResponse_1.ApiResponse.success('Health check passed', healthData));
});
// Các Routes khác (Router - Controller - Service) sẽ được mount ở đây sau
// Ví dụ: app.use('/api/users', userRoutes);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/farm-zones', farm_zones_routes_1.default);
app.use('/api/crops', crops_routes_1.default);
app.use('/api/sensors', sensors_routes_1.default);
// --- 3. Error Handling Middleware (luôn để cuối cùng) ---
app.use(error_middleware_1.errorHandler);
exports.default = app;
