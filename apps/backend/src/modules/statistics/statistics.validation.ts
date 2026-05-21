import { z } from 'zod';

export const getAlertStatsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const getReadingStatsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('farmZoneId không hợp lệ').optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});
