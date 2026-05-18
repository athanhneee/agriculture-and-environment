export const cropZones = [
  {
    id: "north-greenhouse",
    name: "Nhà kính phía Bắc",
    crop: "Rau thủy canh",
    status: "Ổn định",
    area: "1.8 ha",
    soilMoisture: 68,
    temperature: 27,
    humidity: 72,
    light: 820,
  },
  {
    id: "orchard-b",
    name: "Vườn cây khu B",
    crop: "Cây ăn quả",
    status: "Cần tưới",
    area: "2.4 ha",
    soilMoisture: 42,
    temperature: 31,
    humidity: 58,
    light: 910,
  },
  {
    id: "seedling-zone",
    name: "Khu ươm giống",
    crop: "Cây giống",
    status: "Theo dõi",
    area: "0.6 ha",
    soilMoisture: 61,
    temperature: 25,
    humidity: 76,
    light: 640,
  },
];

export const alerts = [
  {
    title: "Độ ẩm đất thấp",
    zone: "Vườn cây khu B",
    level: "Cao",
    time: "10 phút trước",
  },
  {
    title: "Nhiệt độ tăng nhanh",
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

export const sensorReadings = [
  { label: "Độ ẩm đất", value: "68%", note: "+4% so với hôm qua" },
  { label: "Nhiệt độ", value: "27°C", note: "Trong ngưỡng tốt" },
  { label: "Độ ẩm không khí", value: "72%", note: "Ổn định" },
  { label: "Ánh sáng", value: "820 lux", note: "Đủ cho sinh trưởng" },
];
