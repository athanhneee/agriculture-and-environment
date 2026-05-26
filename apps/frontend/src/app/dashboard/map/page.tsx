import { getFarmZones } from "@/lib/farm-zones-server";
import { MapClient } from "@/components/dashboard/MapClient";

export const dynamic = "force-dynamic";

export default async function FarmMapPage() {
  const zones = await getFarmZones();

  return <MapClient initialZones={zones} />;
}
