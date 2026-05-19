import { z } from 'zod';
import { CropStatus } from '@prisma/client';

export const createCropSchema = z.object({
  name: z.string().min(1, 'Tên cây trồng không được để trống'),
  variety: z.string().min(1, 'Giống cây trồng không được để trống'),
  plantedDate: z.string().datetime('Ngày trồng phải đúng định dạng ISO 8601'),
  expectedHarvestDate: z.string().datetime('Ngày thu hoạch dự kiến phải đúng định dạng ISO 8601').optional(),
  status: z.nativeEnum(CropStatus).optional(),
  farmZoneId: z.string().uuid('ID vùng canh tác không hợp lệ')
}).refine((data) => {
  if (data.expectedHarvestDate) {
    const planted = new Date(data.plantedDate);
    const harvest = new Date(data.expectedHarvestDate);
    return harvest > planted;
  }
  return true;
}, {
  message: 'Ngày thu hoạch dự kiến phải lớn hơn ngày trồng',
  path: ['expectedHarvestDate']
});

export const updateCropSchema = z.object({
  name: z.string().min(1, 'Tên cây trồng không được để trống').optional(),
  variety: z.string().min(1, 'Giống cây trồng không được để trống').optional(),
  plantedDate: z.string().datetime('Ngày trồng phải đúng định dạng ISO 8601').optional(),
  expectedHarvestDate: z.string().datetime('Ngày thu hoạch dự kiến phải đúng định dạng ISO 8601').optional(),
  status: z.nativeEnum(CropStatus).optional(),
  farmZoneId: z.string().uuid('ID vùng canh tác không hợp lệ').optional()
}).refine((data) => {
  if (data.plantedDate && data.expectedHarvestDate) {
    const planted = new Date(data.plantedDate);
    const harvest = new Date(data.expectedHarvestDate);
    return harvest > planted;
  }
  return true;
}, {
  message: 'Ngày thu hoạch dự kiến phải lớn hơn ngày trồng',
  path: ['expectedHarvestDate']
});

export type CreateCropInput = z.infer<typeof createCropSchema>;
export type UpdateCropInput = z.infer<typeof updateCropSchema>;
