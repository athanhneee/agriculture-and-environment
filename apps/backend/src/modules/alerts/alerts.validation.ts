import { z } from 'zod';

export const getAlertsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('Invalid farmZoneId').optional(),
    status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']).optional(),
    severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
    type: z.enum([
      'CRITICAL_WEATHER', 'SOIL_DRY', 'SENSOR_MALFUNCTION', 'OVERHEATING',
      'HIGH_TEMPERATURE', 'LOW_SOIL_MOISTURE', 'HIGH_HUMIDITY', 'LOW_LIGHT', 'PEST_RISK'
    ]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
