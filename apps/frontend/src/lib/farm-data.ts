export type CropZone = {
  id: string;
  name: string;
  crop: string;
  area: string;
  status: "Ổn định" | "Cần tưới" | "Theo dõi";
  location: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  light: number;
};

export const cropZones: CropZone[] = [
  {
    id: "zone-mien-bac",
    name: "Miền Bắc Việt Nam",
    crop: "Rau thủy canh · Dưa leo",
    area: "2.4 ha",
    status: "Ổn định",
    location: "Hà Nội, Vĩnh Phúc",
    soilMoisture: 65,
    temperature: 24,
    humidity: 78,
    light: 720,
  },
  {
    id: "zone-mien-trung",
    name: "Miền Trung Việt Nam",
    crop: "Cây ăn quả · Thanh long",
    area: "3.1 ha",
    status: "Cần tưới",
    location: "Đà Nẵng, Quảng Nam",
    soilMoisture: 38,
    temperature: 34,
    humidity: 55,
    light: 1050,
  },
  {
    id: "zone-mien-nam",
    name: "Miền Nam Việt Nam",
    crop: "Lúa · Xoài · Sầu riêng",
    area: "4.8 ha",
    status: "Theo dõi",
    location: "Tiền Giang, Long An",
    soilMoisture: 72,
    temperature: 31,
    humidity: 82,
    light: 890,
  },
];

export const sensorReadings = [
  { label: "Độ ẩm đất TB", value: "58%", change: "+3%", state: "Tốt" },
  { label: "Nhiệt độ TB", value: "30°C", change: "+2°C", state: "Bình thường" },
  { label: "Độ ẩm không khí", value: "72%", change: "+1%", state: "Tốt" },
  { label: "Ánh sáng TB", value: "887 lux", change: "+45", state: "Đủ sáng" },
];

export const alerts = [
  {
    title: "Độ ẩm đất thấp — Miền Trung",
    zone: "Miền Trung Việt Nam",
    level: "Cao",
    time: "10 phút trước",
  },
  {
    title: "Nhiệt độ tăng cao bất thường",
    zone: "Miền Trung Việt Nam",
    level: "Trung bình",
    time: "28 phút trước",
  },
  {
    title: "Cảm biến ánh sáng cần kiểm tra",
    zone: "Miền Bắc Việt Nam",
    level: "Thấp",
    time: "1 giờ trước",
  },
];

