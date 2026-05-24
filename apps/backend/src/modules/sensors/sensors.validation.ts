import { z } from 'zod';
import { SensorType, SensorStatus } from '@prisma/client';

export const createSensorSchema = z.object({
  name: z.string().min(1, 'Tên cảm biến không được để trống'),
  code: z.string().min(1, 'Mã cảm biến không được để trống'),
  type: z.nativeEnum(SensorType),
  unit: z.string().min(1, 'Đơn vị đo không được để trống'),
  status: z.nativeEnum(SensorStatus).optional(),
  farmZoneId: z.string().uuid('ID vùng canh tác không hợp lệ')
});

export const updateSensorSchema = z.object({
  name: z.string().min(1, 'Tên cảm biến không được để trống').optional(),
  code: z.string().min(1, 'Mã cảm biến không được để trống').optional(),
  type: z.nativeEnum(SensorType).optional(),
  unit: z.string().min(1, 'Đơn vị đo không được để trống').optional(),
  status: z.nativeEnum(SensorStatus).optional(),
  farmZoneId: z.string().uuid('ID vùng canh tác không hợp lệ').optional()
});

export type CreateSensorInput = z.infer<typeof createSensorSchema>;
export type UpdateSensorInput = z.infer<typeof updateSensorSchema>;
