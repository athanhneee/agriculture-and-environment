import { z } from 'zod';

export const exportAlertsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const exportReadingsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('farmZoneId không hợp lệ').optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});
