import { z } from 'zod';

const dateLike = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}, 'Ngày không hợp lệ');

export const getAlertStatsSchema = z.object({
  query: z.object({
    from: dateLike.optional(),
    to: dateLike.optional(),
  }),
});

export const getReadingStatsSchema = z.object({
  query: z.object({
    farmZoneId: z.string().uuid('farmZoneId không hợp lệ').optional(),
    from: dateLike.optional(),
    to: dateLike.optional(),
    groupBy: z.enum(['hour', 'day']).optional(),
  }),
});