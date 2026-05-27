"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { type FarmZoneFormValues } from "@/lib/validations";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function createFarmZoneAction(values: FarmZoneFormValues) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/api/farm-zones`, {
      method: "POST",
      headers,
      body: JSON.stringify(values),
    });

    // Check if content-type is json
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return {
        success: false,
        message: "Máy chủ phản hồi lỗi không đúng định dạng JSON.",
      };
    }

    const body = await res.json();

    if (!res.ok || !body.success) {
      return {
        success: false,
        message: body.message || "Có lỗi xảy ra khi tạo vùng trồng mới",
        errors: body.errors,
      };
    }

    revalidatePath("/dashboard/zones");
    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    console.error("Error creating farm zone in Server Action:", error);
    return {
      success: false,
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
    };
  }
}

export async function updateFarmZoneAction(id: string, values: Partial<FarmZoneFormValues>) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/api/farm-zones/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(values),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return { success: false, message: "Máy chủ phản hồi lỗi không đúng định dạng JSON." };
    }

    const body = await res.json();

    if (!res.ok || !body.success) {
      return { success: false, message: body.message || "Có lỗi xảy ra khi cập nhật vùng trồng", errors: body.errors };
    }

    revalidatePath("/dashboard/zones");
    revalidatePath(`/dashboard/zones/${id}`);
    return { success: true, data: body.data };
  } catch (error) {
    console.error("Error updating farm zone in Server Action:", error);
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
}

export async function deleteFarmZoneAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/api/farm-zones/${id}`, {
      method: "DELETE",
      headers,
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return { success: false, message: "Máy chủ phản hồi lỗi không đúng định dạng JSON." };
    }

    const body = await res.json();

    if (!res.ok || !body.success) {
      return { success: false, message: body.message || "Có lỗi xảy ra khi xóa vùng trồng" };
    }

    revalidatePath("/dashboard/zones");
    return { success: true };
  } catch (error) {
    console.error("Error deleting farm zone in Server Action:", error);
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
}
