import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { SensorsClient } from "@/components/dashboard/SensorsClient";
import { ExportExcelButtons } from "@/components/dashboard/ExportExcelButtons";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Quản lý Cảm biến | Smart Farm Monitoring System",
  description:
    "Quản lý thiết bị cảm biến IoT được gán cho từng vùng trồng trong nông trại.",
};

export default async function SensorsPage() {
  const zones = await getFarmZones();

  const formattedZones = zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
  }));

  return (
    <div className="space-y-6">
      <SensorsClient initialZones={formattedZones} />
      <ExportExcelButtons />
    </div>
  );
}
