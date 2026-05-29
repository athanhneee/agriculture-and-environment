import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  // output: 'standalone' chỉ dùng khi build production (Docker)
  // Trong dev mode bỏ qua để tránh tốn tài nguyên không cần thiết
  ...(isProd ? { output: "standalone" } : {}),

  // Turbopack: chỉ định đúng thư mục gốc của frontend
  // Tránh Turbopack scan nhầm cả thư mục apps/ (backend, docs, node_modules...)
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
