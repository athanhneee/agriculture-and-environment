import { create } from "zustand";

export interface SensorReading {
  id: string;
  farmZoneId: string;
  sensorId: string;
  temperature: number;
  airHumidity: number;
  soilMoisture: number;
  lightIntensity: number;
  recordedAt: string;
}

export interface Alert {
  id: string;
  farmZoneId: string;
  sensorReadingId?: string;
  farmZone?: {
    id: string;
    name: string;
    ownerId?: string;
  };
  type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface ChartDataPoint {
  time: string;
  temperature: number;
  airHumidity: number;
  soilMoisture: number;
  lightIntensity: number;
}

interface RealtimeState {
  readings: ChartDataPoint[];
  alerts: Alert[];
  latestReading: {
    temperature?: number;
    airHumidity?: number;
    soilMoisture?: number;
    lightIntensity?: number;
    recordedAt?: string;
  } | null;
  setInitialData: (params: {
    latestReading: Record<string, unknown> | null;
    alerts: Alert[];
  }) => void;
  addReading: (payload: { farmZoneId: string; reading: SensorReading; timestamp: string }) => void;
  addAlert: (alert: Alert) => void;
  clearStore: () => void;
}

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  readings: [],
  alerts: [],
  latestReading: null,

  setInitialData: ({ latestReading, alerts }) => {
    // Chuyển đổi latestReading ban đầu thành điểm dữ liệu đầu tiên cho biểu đồ
    const initialChartData: ChartDataPoint[] = [];
    if (latestReading && latestReading.recordedAt) {
      initialChartData.push({
        time: formatTime(String(latestReading.recordedAt)),
        temperature: Number(latestReading.temperature) || 0,
        airHumidity: Number(latestReading.airHumidity) || 0,
        soilMoisture: Number(latestReading.soilMoisture) || 0,
        lightIntensity: Number(latestReading.lightIntensity) || 0,
      });
    }

    set({
      latestReading: latestReading ? {
        temperature: Number(latestReading.temperature) || 0,
        airHumidity: Number(latestReading.airHumidity) || 0,
        soilMoisture: Number(latestReading.soilMoisture) || 0,
        lightIntensity: Number(latestReading.lightIntensity) || 0,
        recordedAt: String(latestReading.recordedAt || ""),
      } : null,
      alerts,
      readings: initialChartData,
    });
  },

  addReading: (payload) => {
    const { reading } = payload;
    const newPoint: ChartDataPoint = {
      time: formatTime(reading.recordedAt),
      temperature: reading.temperature,
      airHumidity: reading.airHumidity,
      soilMoisture: reading.soilMoisture,
      lightIntensity: reading.lightIntensity,
    };

    set((state) => {
      // Giới hạn biểu đồ tối đa 20 điểm dữ liệu
      const updatedReadings = [...state.readings, newPoint];
      if (updatedReadings.length > 20) {
        updatedReadings.shift();
      }

      return {
        readings: updatedReadings,
        latestReading: {
          temperature: reading.temperature,
          airHumidity: reading.airHumidity,
          soilMoisture: reading.soilMoisture,
          lightIntensity: reading.lightIntensity,
          recordedAt: reading.recordedAt,
        },
      };
    });
  },

  addAlert: (alert) => {
    set((state) => {
      // Thêm alert mới vào đầu danh sách, giữ tối đa 30 alert gần nhất
      const updatedAlerts = [alert, ...state.alerts].slice(0, 30);
      return { alerts: updatedAlerts };
    });
  },

  clearStore: () => {
    set({
      readings: [],
      alerts: [],
      latestReading: null,
    });
  },
}));
