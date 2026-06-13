import { cookies } from "next/headers";
import { type Alert } from "@/stores/realtime.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (!refreshToken) return headers;

  try {
    // Gọi ngầm API backend đổi refreshToken lấy accessToken dùng tạm cho vòng đời SSR này
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const body = await res.json();
      if (body.success && body.data?.accessToken) {
        headers.Authorization = `Bearer ${body.data.accessToken}`;
      }
    }
  } catch (err) {
    console.error("Lỗi khi lấy accessToken qua SSR:", err);
  }

  return headers;
}

export interface OverviewStats {
  usersCount: number;
  zonesCount: number;
  cropsCount: number;
  sensorsCount: number;
  openAlertsCount: number;
  criticalAlertsCount: number;
  averageTemperature: number;
  averageAirHumidity: number;
  averageSoilMoisture: number;
  averageLightIntensity: number;
}

const emptyOverview: OverviewStats = {
  usersCount: 0,
  zonesCount: 0,
  cropsCount: 0,
  sensorsCount: 0,
  openAlertsCount: 0,
  criticalAlertsCount: 0,
  averageTemperature: 0,
  averageAirHumidity: 0,
  averageSoilMoisture: 0,
  averageLightIntensity: 0,
};

function normalizeOverview(data: Record<string, number | undefined>): OverviewStats {
  return {
    usersCount: data?.totalUsers ?? 0,
    zonesCount: data?.zonesCount ?? data?.totalFarmZones ?? 0,
    cropsCount: data?.cropsCount ?? data?.totalCrops ?? 0,
    sensorsCount: data?.sensorsCount ?? data?.totalSensors ?? 0,
    openAlertsCount: data?.openAlertsCount ?? data?.openAlerts ?? 0,
    criticalAlertsCount: data?.criticalAlertsCount ?? data?.criticalAlerts ?? 0,
    averageTemperature: data?.averageTemperature ?? 0,
    averageAirHumidity: data?.averageAirHumidity ?? 0,
    averageSoilMoisture: data?.averageSoilMoisture ?? 0,
    averageLightIntensity: data?.averageLightIntensity ?? 0,
  };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/statistics/overview`, {
      headers,
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error("Fetch stats failed:", res.statusText);
      return emptyOverview;
    }

    const body = await res.json();

    if (!body.success || !body.data) {
      return emptyOverview;
    }

    return normalizeOverview(body.data);
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return emptyOverview;
  }
}

export async function getLatestSensorReading(): Promise<import("@/stores/realtime.store").SensorReading | null> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/sensor-readings/latest`, {
      headers,
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Fetch latest readings failed:", res.statusText);
      return null;
    }

    const body = await res.json();
    return body.success ? body.data : null;
  } catch (error) {
    console.error("Error fetching latest readings:", error);
    return null;
  }
}

export async function getOpenAlerts(): Promise<Alert[]> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/alerts?status=OPEN`, {
      headers,
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      console.error("Fetch open alerts failed:", res.statusText);
      return [];
    }

    const body = await res.json();

    if (!body.success || !body.data) {
      return [];
    }

    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.data.data)) return body.data.data;
    if (Array.isArray(body.data.items)) return body.data.items;

    return [];
  } catch (error) {
    console.error("Error fetching open alerts:", error);
    return [];
  }
}