"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const farm_zones_controller_1 = require("./farm-zones.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Tất cả endpoints đều yêu cầu authentication
router.use(auth_middleware_1.authenticate);
router.get('/', (0, asyncHandler_1.asyncHandler)(farm_zones_controller_1.FarmZoneController.getFarmZones));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(farm_zones_controller_1.FarmZoneController.getFarmZoneById));
router.post('/', (0, auth_middleware_1.authorize)(['ADMIN']), (0, asyncHandler_1.asyncHandler)(farm_zones_controller_1.FarmZoneController.createFarmZone));
router.patch('/:id', (0, auth_middleware_1.authorize)(['ADMIN']), (0, asyncHandler_1.asyncHandler)(farm_zones_controller_1.FarmZoneController.updateFarmZone));
router.delete('/:id', (0, auth_middleware_1.authorize)(['ADMIN']), (0, asyncHandler_1.asyncHandler)(farm_zones_controller_1.FarmZoneController.deleteFarmZone));
exports.default = router;
