import { ProfileClient } from "@/components/profile/ProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Smart Farm Monitoring",
  description: "Quản lý thông tin hồ sơ cá nhân và bảo mật tài khoản",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
