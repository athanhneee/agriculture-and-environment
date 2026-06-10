import { z } from 'zod';

const dateLike = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}, 'Ngày không hợp lệ');

const farmZoneId = z.string().uuid('farmZoneId không hợp lệ');

export const exportAlertsSchema = z.object({
  query: z.object({
    farmZoneId: farmZoneId.optional(),
    from: dateLike.optional(),
    to: dateLike.optional(),
  }),
});

export const exportReadingsSchema = z.object({
  query: z.object({
    farmZoneId: farmZoneId.optional(),
    from: dateLike.optional(),
    to: dateLike.optional(),
  }),
});
