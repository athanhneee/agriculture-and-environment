import { cookies } from "next/headers";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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

// ─── Per-request auth header helper ────────────────────────────────────────────
// Dùng React cache() để dedup: nhiều component gọi hàm này trong cùng 1 render
// chỉ đọc cookie 1 lần duy nhất.
const getAuthHeaders = cache(async (): Promise<Record<string, string>> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
});

// ─── Fetch tất cả zones (không cần auth đặc biệt) ─────────────────────────────
// Dùng unstable_cache để cache kết quả tại tầng Next.js (cross-request cache).
// Tag "farm-zones" cho phép revalidateTag("farm-zones") khi có thay đổi.
const fetchAllZones = unstable_cache(
  async (): Promise<FarmZone[]> => {
    const res = await fetch(`${API_URL}/api/farm-zones?limit=1000`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error("Fetch farm zones failed:", res.status, res.statusText);
      return [];
    }

    const body = await res.json();
    if (!body.success) return [];

    return unwrapList<FarmZone>(body.data);
  },
  ["farm-zones-list"],         // cache key
  { revalidate: 30, tags: ["farm-zones"] }
);

// ─── Fetch zone theo ID ────────────────────────────────────────────────────────
const fetchZoneById = unstable_cache(
  async (id: string): Promise<FarmZone | null> => {
    const res = await fetch(`${API_URL}/api/farm-zones/${id}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Fetch farm zone ${id} failed:`, res.statusText);
      return null;
    }

    const body = await res.json();
    return body.success ? body.data : null;
  },
  ["farm-zone-by-id"],         // cache key prefix
  { revalidate: 30, tags: ["farm-zones"] }
);

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả vùng trồng.
 * - Nếu có accessToken (user đã đăng nhập): fetch với auth header (per-request, không cache cross-request).
 * - Nếu chưa đăng nhập hoặc không cần auth: dùng unstable_cache để cache cross-request.
 */
export const getFarmZones = cache(async (): Promise<FarmZone[]> => {
  try {
    const headers = await getAuthHeaders();

    // Có token → cần fetch với auth header (không dùng cross-request cache vì data là per-user)
    if (headers.Authorization) {
      const res = await fetch(`${API_URL}/api/farm-zones?limit=1000`, {
        headers,
        next: { revalidate: 30 },
      });

      if (!res.ok) {
        console.error("Fetch farm zones failed:", res.status, res.statusText);
        return [];
      }

      const body = await res.json();
      if (!body.success) return [];
      return unwrapList<FarmZone>(body.data);
    }

    // Không có token → dùng cross-request cache
    return fetchAllZones();
  } catch (error) {
    console.error("Error fetching farm zones:", error);
    return [];
  }
});

/**
 * Lấy chi tiết 1 vùng trồng theo ID.
 * React cache() đảm bảo cùng ID trong 1 render chỉ fetch 1 lần.
 */
export const getFarmZoneById = cache(async (id: string): Promise<FarmZone | null> => {
  try {
    const headers = await getAuthHeaders();

    if (headers.Authorization) {
      const res = await fetch(`${API_URL}/api/farm-zones/${id}`, {
        headers,
        next: { revalidate: 30 },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`Fetch farm zone ${id} failed:`, res.statusText);
        return null;
      }

      const body = await res.json();
      return body.success ? body.data : null;
    }

    return fetchZoneById(id);
  } catch (error) {
    console.error(`Error fetching farm zone ${id}:`, error);
    return null;
  }
});

/**
 * Lấy danh sách ID của tất cả zones — dùng cho generateStaticParams.
 * Gọi trực tiếp không cần auth để pre-build trang tĩnh.
 */
export async function getAllZoneIds(): Promise<string[]> {
  try {
    const zones = await fetchAllZones();
    return zones.map((z) => z.id);
  } catch {
    return [];
  }
}
