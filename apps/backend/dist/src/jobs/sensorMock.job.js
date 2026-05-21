"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSensorMockJob = exports.startSensorMockJob = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const socket_1 = require("../sockets/socket");
const env_1 = require("../config/env");
const alerts_service_1 = require("../modules/alerts/alerts.service");
let mockInterval = null;
const generateMockData = async () => {
    try {
        const activeFarmZones = await prisma_1.default.farmZone.findMany({
            where: { status: 'ACTIVE' },
            include: { sensors: { where: { status: 'ACTIVE' } } }
        });
        if (activeFarmZones.length === 0)
            return;
        for (const zone of activeFarmZones) {
            if (zone.sensors.length === 0)
                continue; // Need at least one sensor to attach reading to
            // Generate random valid data
            const temperature = Number((Math.random() * (42 - 18) + 18).toFixed(2));
            const airHumidity = Number((Math.random() * (95 - 40) + 40).toFixed(2));
            const soilMoisture = Number((Math.random() * (90 - 15) + 15).toFixed(2));
            const lightIntensity = Math.floor(Math.random() * (90000 - 1000) + 1000);
            const targetSensor = zone.sensors[0];
            const reading = await prisma_1.default.sensorReading.create({
                data: {
                    farmZoneId: zone.id,
                    sensorId: targetSensor.id,
                    temperature,
                    airHumidity,
                    soilMoisture,
                    lightIntensity,
                }
            });
            // Đánh giá cảnh báo ngay sau khi tạo reading
            await alerts_service_1.AlertService.processNewReading(reading);
            const io = (0, socket_1.getIO)();
            const payload = {
                farmZoneId: zone.id,
                reading,
                timestamp: reading.recordedAt
            };
            // Emit to farm-zone specific room
            io.to(`farm-zone:${zone.id}`).emit('sensor:reading-created', payload);
            // Emit globally for overview dashboard
            io.emit('sensor:global-reading', payload);
        }
    }
    catch (error) {
        console.error('Error generating mock sensor data:', error);
    }
};
const startSensorMockJob = () => {
    if (env_1.env.sensorMockEnabled) {
        console.log(` Starting Sensor Mock Job (Interval: ${env_1.env.sensorMockIntervalMs}ms)`);
        mockInterval = setInterval(generateMockData, env_1.env.sensorMockIntervalMs);
    }
    else {
        console.log('Sensor Mock Job is disabled via environment variables.');
    }
};
exports.startSensorMockJob = startSensorMockJob;
const stopSensorMockJob = () => {
    if (mockInterval) {
        clearInterval(mockInterval);
        console.log(' Sensor Mock Job stopped.');
    }
};
exports.stopSensorMockJob = stopSensorMockJob;
