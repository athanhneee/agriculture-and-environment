import { Metadata } from "next";
import { UsersManagerClient } from "@/components/admin/UsersManagerClient";

export const metadata: Metadata = {
  title: "Quản lý Người dùng | Smart Farm Monitoring System",
  description: "Trang quản lý người dùng dành cho quản trị viên hệ thống.",
};

export default function UsersManagementPage() {
  return (
    <div className="w-full">
      <UsersManagerClient />
    </div>
  );
}
