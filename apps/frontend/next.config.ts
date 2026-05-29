import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  output: "standalone",

  // Turbopack: chỉ định đúng thư mục gốc của frontend để tránh scan toàn bộ folder cha
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
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
