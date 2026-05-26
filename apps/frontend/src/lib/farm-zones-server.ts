import { cookies } from "next/headers";
import { type FarmZone } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getFarmZones(): Promise<FarmZone[]> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/farm-zones`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Fetch farm zones failed:", res.status, res.statusText);
      return [];
    }

    const body = await res.json();

    if (!body.success) return [];

    return unwrapList<FarmZone>(body.data);
  } catch (error) {
    console.error("Error fetching farm zones:", error);
    return [];
  }
}

export async function getFarmZoneById(id: string): Promise<FarmZone | null> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/farm-zones/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Fetch farm zone ${id} failed:`, res.statusText);
      return null;
    }

    const body = await res.json();

    return body.success ? body.data : null;
  } catch (error) {
    console.error(`Error fetching farm zone ${id}:`, error);
    return null;
  }
}
