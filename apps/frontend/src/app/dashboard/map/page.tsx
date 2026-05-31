import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { MapClient } from "@/components/dashboard/MapClient";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Bản Đồ Nông Trại | Thành Phát An Smart Farm",
  description: "Bản đồ phân vùng trực quan các vùng trồng và cảm biến IoT tại Thành Phát An Smart Farm.",
};

export default async function FarmMapPage() {
  const zones = await getFarmZones();

  return <MapClient initialZones={zones} />;
}
