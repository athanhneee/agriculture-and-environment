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
    id: "north-greenhouse",
    name: "Nhà kính phía Bắc",
    crop: "Rau thủy canh",
    area: "1.8 ha",
    status: "Ổn định",
    location: "Khu A",
    soilMoisture: 68,
    temperature: 27,
    humidity: 72,
    light: 820,
  },
  {
    id: "orchard-b",
    name: "Vườn cây khu B",
    crop: "Cây ăn quả",
    area: "2.4 ha",
    status: "Cần tưới",
    location: "Khu B",
    soilMoisture: 42,
    temperature: 31,
    humidity: 58,
    light: 910,
  },
  {
    id: "seedling-zone",
    name: "Khu ươm giống",
    crop: "Cây giống",
    area: "0.6 ha",
    status: "Theo dõi",
    location: "Khu C",
    soilMoisture: 61,
    temperature: 25,
    humidity: 76,
    light: 640,
  },
];

export const sensorReadings = [
  { label: "Độ ẩm đất", value: "68%", change: "+4%", state: "Tốt" },
  { label: "Nhiệt độ", value: "27°C", change: "-1°C", state: "Ổn định" },
  { label: "Độ ẩm không khí", value: "72%", change: "+2%", state: "Tốt" },
  { label: "Ánh sáng", value: "820 lux", change: "+80", state: "Đủ sáng" },
];

export const alerts = [
  {
    title: "Độ ẩm đất thấp",
    zone: "Vườn cây khu B",
    level: "Cao",
    time: "10 phút trước",
  },
  {
    title: "Nhiệt độ nhà kính tăng nhanh",
    zone: "Nhà kính phía Bắc",
    level: "Trung bình",
    time: "24 phút trước",
  },
  {
    title: "Cảm biến ánh sáng cần kiểm tra",
    zone: "Khu ươm giống",
    level: "Thấp",
    time: "1 giờ trước",
  },
];
