import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().trim().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải có ít nhất 1 chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const farmZoneSchema = z.object({
  name: z.string().trim().min(1, "Tên vùng trồng không được để trống"),
  description: z.string().trim().optional(),
  area: z.number().positive("Diện tích phải lớn hơn 0"),
  latitude: z
    .number()
    .min(-90, "Vĩ độ không được nhỏ hơn -90")
    .max(90, "Vĩ độ không được lớn hơn 90"),
  longitude: z
    .number()
    .min(-180, "Kinh độ không được nhỏ hơn -180")
    .max(180, "Kinh độ không được lớn hơn 180"),
  soilType: z.string().trim().min(1, "Vui lòng nhập loại đất"),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"], {
    message: "Vui lòng chọn trạng thái hợp lệ",
  }),
});

export type FarmZoneFormValues = z.infer<typeof farmZoneSchema>;

export const cropSchema = z
  .object({
    name: z.string().trim().min(1, "Tên cây trồng không được để trống"),
    variety: z.string().trim().min(1, "Giống cây không được để trống"),
    plantedDate: z.string().min(1, "Vui lòng chọn ngày trồng"),
    expectedHarvestDate: z.string().nullable().optional().or(z.literal("")),
    status: z.enum(["PLANTED", "GROWING", "HARVESTED", "DISEASED"], {
      message: "Vui lòng chọn trạng thái cây trồng",
    }),
    farmZoneId: z.string().min(1, "Vui lòng chọn vùng trồng"),
  })
  .refine(
    (data) => {
      if (!data.expectedHarvestDate) return true;
      const planted = new Date(data.plantedDate);
      const harvest = new Date(data.expectedHarvestDate);
      return harvest > planted;
    },
    {
      message: "Ngày thu hoạch dự kiến phải sau ngày trồng",
      path: ["expectedHarvestDate"],
    }
  );

export type CropFormValues = z.infer<typeof cropSchema>;

export const sensorSchema = z.object({
  name: z.string().trim().min(1, "Tên cảm biến không được để trống"),
  code: z.string().trim().min(1, "Mã thiết bị không được để trống"),
  type: z.enum(["TEMPERATURE", "AIR_HUMIDITY", "SOIL_MOISTURE", "LIGHT_INTENSITY", "ALL_IN_ONE"], {
    message: "Vui lòng chọn loại cảm biến hợp lệ",
  }),
  unit: z.string().trim().min(1, "Vui lòng nhập đơn vị đo (ví dụ: °C, %, Lux...)"),
  status: z.enum(["ACTIVE", "INACTIVE", "ERROR"], {
    message: "Vui lòng chọn trạng thái hoạt động",
  }),
  farmZoneId: z.string().min(1, "Vui lòng chọn vùng trồng"),
});

export type SensorFormValues = z.infer<typeof sensorSchema>;

