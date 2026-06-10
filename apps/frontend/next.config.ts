import type { NextConfig } from "next";

// Kiểm tra môi trường: chỉ bật các tính năng nặng khi build production thật sự
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Nén response để giảm băng thông
  compress: true,

  // Ẩn header "X-Powered-By: Next.js" để tránh lộ thông tin công nghệ
  poweredByHeader: false,

  // output: "standalone" — chỉ bật khi build production (phục vụ Docker deploy)
  // Tắt trong dev để tránh Next.js chạy File Tracing liên tục gây lag máy local
  ...(isProd ? { output: "standalone" } : {}),

  // Turbopack: chỉ định đúng thư mục gốc của frontend
  // Ngăn Turbopack scan nhầm toàn bộ thư mục apps/ (kể cả backend, node_modules backend...)
  turbopack: {
    root: __dirname,
  },

  // Cấu hình security headers bảo vệ ứng dụng khỏi các lỗ hổng bảo mật cơ bản
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Chống tấn công Clickjacking: chỉ cho phép nhúng iframe cùng domain
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Chống tấn công MIME Sniffing: buộc trình duyệt theo đúng Content-Type
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Kiểm soát thông tin Referrer khi người dùng click link ra ngoài
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Vô hiệu hóa quyền truy cập Camera, Microphone, Geolocation
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
