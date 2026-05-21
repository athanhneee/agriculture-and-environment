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

async function refreshAccessToken() {
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
  list: () => apiRequest<FarmZone[]>("/api/farm-zones"),
  detail: (id: string) => apiRequest<FarmZone>(`/api/farm-zones/${id}`),
  create: (payload: FarmZoneFormValues) =>
    apiRequest<FarmZone>("/api/farm-zones", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
