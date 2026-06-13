import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { FarmZonesBrowser } from "@/components/dashboard/FarmZonesBrowser";

// Using SSR (dynamic rendering) inherited from dashboard layout

export const metadata: Metadata = {
  title: "Quản lý Vùng Trồng | Smart Farm Monitoring System",
  description: "Danh sách và quản lý các vùng trồng trọt, cảm biến và chỉ số đo lường nông nghiệp thông minh.",
};

export default async function FarmZonesPage() {
  const zones = await getFarmZones();

  return (
    <div className="w-full">
      <FarmZonesBrowser initialZones={zones} />
    </div>
  );
}
