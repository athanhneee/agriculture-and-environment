import { Metadata } from "next";
import { AlertsClient } from "@/components/dashboard/AlertsClient";
import { getOpenAlerts } from "@/lib/dashboard-server";
import { getFarmZones } from "@/lib/farm-zones-server";
import type { AlertItem } from "@/lib/api";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Cảnh báo Hệ Thống | Thành Phát An Smart Farm",
  description: "Theo dõi và xử lý các cảnh báo thời gian thực từ cảm biến đo đạc.",
};

export default async function AlertsPage() {
  const [alerts, zones] = await Promise.all([getOpenAlerts(), getFarmZones()]);

  return (
    <AlertsClient
      initialAlerts={alerts as AlertItem[]}
      zones={zones.map((zone) => ({ id: zone.id, name: zone.name }))}
    />
  );
}
