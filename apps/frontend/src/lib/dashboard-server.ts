import { cookies } from "next/headers";
import { type Alert } from "@/stores/realtime.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export interface OverviewStats {
  zonesCount: number;
  cropsCount: number;
  sensorsCount: number;
  openAlertsCount: number;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/statistics/overview`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Fetch stats failed:", res.statusText);
      return { zonesCount: 0, cropsCount: 0, sensorsCount: 0, openAlertsCount: 0 };
    }

    const body = await res.json();
    // API backend trả về cấu hình data.zonesCount, data.cropsCount, v.v.
    return body.success && body.data 
      ? body.data 
      : { zonesCount: 0, cropsCount: 0, sensorsCount: 0, openAlertsCount: 0 };
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return { zonesCount: 0, cropsCount: 0, sensorsCount: 0, openAlertsCount: 0 };
  }
}

export async function getLatestSensorReading(): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/sensor-readings/latest`, {
      headers,
      cache: "no-store",
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
    // Gọi API lấy cảnh báo
    const res = await fetch(`${API_URL}/api/alerts?status=OPEN`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Fetch open alerts failed:", res.statusText);
      return [];
    }

    const body = await res.json();
    // Kiểm tra cấu trúc API trả về, nếu là { success: true, data: { data: [...] } } (khi dùng getAlerts phân trang)
    if (body.success && body.data) {
      if (Array.isArray(body.data)) return body.data;
      if (body.data.data && Array.isArray(body.data.data)) return body.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching open alerts:", error);
    return [];
  }
}
