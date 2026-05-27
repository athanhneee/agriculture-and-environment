import { getFarmZones } from "@/lib/farm-zones-server";
import { MapClient } from "@/components/dashboard/MapClient";

export const revalidate = 30;

export default async function FarmMapPage() {
  const zones = await getFarmZones();

  return <MapClient initialZones={zones} />;
}
