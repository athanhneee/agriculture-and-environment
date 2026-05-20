import { z } from 'zod';

export const getSensorReadingsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('Invalid farmZoneId').optional(),
    sensorId: z.string().uuid('Invalid sensorId').optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const createSensorReadingSchema = z.object({
  body: z.object({
    sensorId: z.string().uuid('Invalid sensorId'),
    farmZoneId: z.string().uuid('Invalid farmZoneId'),
    temperature: z.number().optional(),
    airHumidity: z.number().optional(),
    soilMoisture: z.number().optional(),
    lightIntensity: z.number().optional(),
  }),
});
