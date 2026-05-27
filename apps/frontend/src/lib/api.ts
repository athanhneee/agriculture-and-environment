import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/lib/auth";
import type { FarmZoneFormValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const apiBaseUrl = API_URL;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

type PaginatedResponse<T> = {
  data: T[];
  metadata?: unknown;
  meta?: unknown;
};

function unwrapList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;

  if (payload && Array.isArray((payload as PaginatedResponse<T>).data)) {
    return (payload as PaginatedResponse<T>).data;
  }

  return [];
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const buildUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const message = response.ok
      ? "Phản hồi không có dữ liệu JSON"
      : "Máy chủ trả về lỗi không đúng định dạng JSON";
    return { success: response.ok, message };
  }

  return response.json() as Promise<ApiResponse<T>>;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
  const response = await fetch(buildUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });
  const body = await parseResponse<{ accessToken: string }>(response);

  if (!response.ok || !body.success || !body.data?.accessToken) {
    useAuthStore.getState().clearAuth();
    throw new ApiError(
      body.message || "Phiên đăng nhập đã hết hạn",
      response.status,
      body.errors,
    );
  }

      useAuthStore.getState().setAccessToken(body.data.accessToken);
      return body.data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, skipRefresh, headers, ...init } = options;
  const token = useAuthStore.getState().accessToken;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (init.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: requestHeaders,
    credentials: "include",
  });
  const body = await parseResponse<T>(response);

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    return apiRequest<T>(path, {
      ...options,
      headers: {
        ...Object.fromEntries(requestHeaders.entries()),
        Authorization: `Bearer ${newToken}`,
      },
      skipRefresh: true,
    });
  }

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.message || "Có lỗi xảy ra khi gọi API",
      response.status,
      body.errors,
    );
  }

  return body.data as T;
}

export async function downloadApiFile(
  path: string,
  filename: string,
  options: RequestOptions = {},
) {
  const { skipAuth, skipRefresh, headers, ...init } = options;
  const token = useAuthStore.getState().accessToken;
  const requestHeaders = new Headers(headers);

  if (!skipAuth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    method: init.method ?? "GET",
    headers: requestHeaders,
    credentials: "include",
  });

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    return downloadApiFile(path, filename, {
      ...options,
      headers: {
        ...Object.fromEntries(requestHeaders.entries()),
        Authorization: `Bearer ${newToken}`,
      },
      skipRefresh: true,
    });
  }

  if (!response.ok) {
    const body = await parseResponse<never>(response);
    throw new ApiError(
      body.message || "Khong the tai file Excel",
      response.status,
      body.errors,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),
  register: (payload: RegisterPayload) =>
    apiRequest<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),
  me: () => apiRequest<AuthUser>("/api/auth/me"),
  logout: () =>
    apiRequest<void>("/api/auth/logout", {
      method: "POST",
    }),
  refreshAccessToken,
};

export type FarmZoneStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type FarmZone = {
  id: string;
  name: string;
  description?: string | null;
  area: number;
  latitude: number;
  longitude: number;
  soilType: string;
  status: FarmZoneStatus;
  cropName?: string;
  latestSensorSummary?: {
    temperature?: number;
    airHumidity?: number;
    soilMoisture?: number;
    lightIntensity?: number;
    recordedAt?: string;
  };
  openAlertsCount?: number;
  sensors?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    unit?: string;
  }>;
  crops?: Array<{
    id: string;
    name: string;
    variety?: string;
    status?: string;
  }>;
  alerts?: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt?: string;
  }>;
};

export const farmZonesApi = {
  list: async () => {
    const payload = await apiRequest<FarmZone[] | PaginatedResponse<FarmZone>>(
      "/api/farm-zones?limit=1000",
    );
    return unwrapList(payload);
  },
  detail: (id: string) => apiRequest<FarmZone>(`/api/farm-zones/${id}`),
  create: (payload: FarmZoneFormValues) =>
    apiRequest<FarmZone>("/api/farm-zones", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const exportsApi = {
  readings: (params?: URLSearchParams) =>
    downloadApiFile(
      `/api/exports/readings.xlsx${params ? `?${params.toString()}` : ""}`,
      "readings.xlsx",
    ),
  alerts: (params?: URLSearchParams) =>
    downloadApiFile(
      `/api/exports/alerts.xlsx${params ? `?${params.toString()}` : ""}`,
      "alerts.xlsx",
    ),
};

export const importsApi = {
  /**
   * Import vùng trồng từ file Excel (.xlsx), CSV (.csv) hoặc TXT (.txt)
   * Gửi multipart/form-data với field tên "file"
   */
  uploadFarmZones: async (
    file: File,
  ): Promise<{ imported: number; skipped: number; errors?: { row: number; message: string }[] }> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(buildUrl("/api/imports/farm-zones"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: formData,
    });

    const body = await parseResponse<{
      imported: number;
      skipped: number;
      errors?: { row: number; message: string }[];
    }>(response);

    if (!response.ok || !body.success) {
      throw new ApiError(
        body.message || "Không thể import file. Vui lòng kiểm tra định dạng.",
        response.status,
        body.errors,
      );
    }

    return body.data as { imported: number; skipped: number; errors?: { row: number; message: string }[] };
  },

  /** Tải file Excel mẫu để làm template import vùng trồng */
  downloadTemplate: () =>
    downloadApiFile(
      "/api/imports/farm-zones/template",
      "farm_zones_template.xlsx",
      { skipAuth: true },
    ),

  /**
   * Import cây trồng hàng loạt từ file Excel (.xlsx), CSV (.csv) hoặc TXT (.txt)
   * Cột "farmZoneName" phải khớp với tên vùng trồng đang sở hữu.
   */
  uploadCrops: async (
    file: File,
  ): Promise<{ imported: number; skipped: number; errors?: { row: number; message: string }[] }> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(buildUrl("/api/imports/crops"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: formData,
    });

    const body = await parseResponse<{
      imported: number;
      skipped: number;
      errors?: { row: number; message: string }[];
    }>(response);

    if (!response.ok || !body.success) {
      throw new ApiError(
        body.message || "Không thể import file cây trồng. Vui lòng kiểm tra định dạng.",
        response.status,
        body.errors,
      );
    }

    return body.data as { imported: number; skipped: number; errors?: { row: number; message: string }[] };
  },

  /** Tải file Excel mẫu để làm template import cây trồng */
  downloadCropsTemplate: () =>
    downloadApiFile(
      "/api/imports/crops/template",
      "crops_template.xlsx",
      { skipAuth: true },
    ),

  /**
   * Import cảm biến hàng loạt từ file Excel (.xlsx), CSV (.csv) hoặc TXT (.txt)
   */
  uploadSensors: async (
    file: File,
  ): Promise<{ imported: number; skipped: number; errors?: { row: number; message: string }[] }> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(buildUrl("/api/imports/sensors"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: formData,
    });

    const body = await parseResponse<{
      imported: number;
      skipped: number;
      errors?: { row: number; message: string }[];
    }>(response);

    if (!response.ok || !body.success) {
      throw new ApiError(
        body.message || "Không thể import file cảm biến. Vui lòng kiểm tra định dạng.",
        response.status,
        body.errors,
      );
    }

    return body.data as { imported: number; skipped: number; errors?: { row: number; message: string }[] };
  },

  /** Tải file Excel mẫu để làm template import cảm biến */
  downloadSensorsTemplate: () =>
    downloadApiFile(
      "/api/imports/sensors/template",
      "sensors_template.xlsx",
      { skipAuth: true },
    ),
};

export type CropStatus = "PLANTED" | "GROWING" | "HARVESTED" | "DISEASED";

export type Crop = {
  id: string;
  name: string;
  variety?: string;
  plantedDate: string;
  expectedHarvestDate?: string;
  status: CropStatus;
  farmZoneId: string;
  farmZone?: { id: string; name: string };
};

export type SensorStatus = "ACTIVE" | "INACTIVE" | "ERROR";
export type SensorType =
  | "TEMPERATURE"
  | "AIR_HUMIDITY"
  | "SOIL_MOISTURE"
  | "LIGHT_INTENSITY"
  | "ALL_IN_ONE";

export type Sensor = {
  id: string;
  name: string;
  code: string;
  type: SensorType;
  unit: string;
  status: SensorStatus;
  farmZoneId: string;
  farmZone?: { id: string; name: string };
};

export type SensorReading = {
  id: string;
  sensorId?: string;
  farmZoneId: string;
  sensor?: {
    id: string;
    name: string;
    code?: string;
    type?: string;
    unit?: string;
  };
  farmZone?: {
    id: string;
    name: string;
  };
  temperature?: number;
  airHumidity?: number;
  soilMoisture?: number;
  lightIntensity?: number;
  recordedAt: string;
};

const cleanParams = (params?: Record<string, string>) => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value && value !== "ALL") search.set(key, value);
  });
  return search.toString();
};

export const cropsApi = {
  list: async (params?: Record<string, string>) => {
    const payload = await apiRequest<Crop[] | PaginatedResponse<Crop>>(
      `/api/crops?${cleanParams(params)}`,
    );
    return unwrapList(payload);
  },
  create: (payload: Partial<Crop>) =>
    apiRequest<Crop>("/api/crops", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<Crop>) =>
    apiRequest<Crop>(`/api/crops/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/api/crops/${id}`, { method: "DELETE" }),
};

export const sensorsApi = {
  list: async (params?: Record<string, string>) => {
    const payload = await apiRequest<Sensor[] | PaginatedResponse<Sensor>>(
      `/api/sensors?${cleanParams(params)}`,
    );
    return unwrapList(payload);
  },
  create: (payload: Partial<Sensor>) =>
    apiRequest<Sensor>("/api/sensors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<Sensor>) =>
    apiRequest<Sensor>(`/api/sensors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/api/sensors/${id}`, { method: "DELETE" }),
};

export const sensorReadingsApi = {
  list: async (params?: Record<string, string>) => {
    const payload = await apiRequest<
      SensorReading[] | PaginatedResponse<SensorReading>
    >(`/api/sensor-readings?${cleanParams(params)}`);
    return unwrapList(payload);
  },
  latest: () => apiRequest<SensorReading[]>("/api/sensor-readings/latest"),
  exportUrl: (params?: Record<string, string>) =>
    `${apiBaseUrl}/api/exports/readings.xlsx?${cleanParams(params)}`,
};

export const statisticsApi = {
  overview: () => apiRequest<any>("/api/statistics/overview"),
  alerts: (params?: Record<string, string>) =>
    apiRequest<any>(`/api/statistics/alerts?${cleanParams(params)}`),
  readings: (params?: Record<string, string>) =>
    apiRequest<any[]>(`/api/statistics/readings?${cleanParams(params)}`),
};
