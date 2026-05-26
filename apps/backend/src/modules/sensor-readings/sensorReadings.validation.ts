import { z } from 'zod';

const dateLike = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}, 'Ngày không hợp lệ');

export const getSensorReadingsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('Invalid farmZoneId').optional(),
    sensorId: z.string().uuid('Invalid sensorId').optional(),
    from: dateLike.optional(),
    to: dateLike.optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
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