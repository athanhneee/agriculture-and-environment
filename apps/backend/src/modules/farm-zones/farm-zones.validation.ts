import { z } from 'zod';
import { ZoneStatus } from '@prisma/client';

export const createFarmZoneSchema = z.object({
  name: z.string().min(1, 'Tên vùng không được để trống'),
  description: z.string().optional(),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  soilType: z.string().min(1, 'Loại đất là bắt buộc'),
  status: z.nativeEnum(ZoneStatus).optional(),
});

export const updateFarmZoneSchema = createFarmZoneSchema.partial();

export type CreateFarmZoneInput = z.infer<typeof createFarmZoneSchema>;
export type UpdateFarmZoneInput = z.infer<typeof updateFarmZoneSchema>;
