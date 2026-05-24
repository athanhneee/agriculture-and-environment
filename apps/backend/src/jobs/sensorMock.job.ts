import prisma from '../config/prisma';
import { getIO } from '../sockets/socket';
import { env } from '../config/env';
import { AlertService } from '../modules/alerts/alerts.service';

let mockInterval: NodeJS.Timeout | null = null;

const generateMockData = async () => {
  try {
    const activeFarmZones = await prisma.farmZone.findMany({
      where: { status: 'ACTIVE' },
      include: { sensors: { where: { status: 'ACTIVE' } } }
    });

    if (activeFarmZones.length === 0) return;

    for (const zone of activeFarmZones) {
      if (zone.sensors.length === 0) continue; // Need at least one sensor to attach reading to

      // Generate random valid data
      const temperature = Number((Math.random() * (42 - 18) + 18).toFixed(2));
      const airHumidity = Number((Math.random() * (95 - 40) + 40).toFixed(2));
      const soilMoisture = Number((Math.random() * (90 - 15) + 15).toFixed(2));
      const lightIntensity = Math.floor(Math.random() * (90000 - 1000) + 1000);

      const targetSensor = zone.sensors[0];

      const reading = await prisma.sensorReading.create({
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
      await AlertService.processNewReading(reading);

      const io = getIO();
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
  } catch (error) {
    console.error('Error generating mock sensor data:', error);
  }
};

export const startSensorMockJob = () => {
  if (env.sensorMockEnabled) {
    console.log(` Starting Sensor Mock Job (Interval: ${env.sensorMockIntervalMs}ms)`);
    mockInterval = setInterval(generateMockData, env.sensorMockIntervalMs);
  } else {
    console.log('Sensor Mock Job is disabled via environment variables.');
  }
};

export const stopSensorMockJob = () => {
  if (mockInterval) {
    clearInterval(mockInterval);
    console.log(' Sensor Mock Job stopped.');
  }
};
