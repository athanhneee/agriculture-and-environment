import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: "swap",
});

const APP_NAME = "Thành Phát An Smart Farm";
const APP_DESCRIPTION =
  "Hệ thống giám sát nông nghiệp thông minh — theo dõi cảm biến IoT thời gian thực, cảnh báo sâu bệnh và phân tích dữ liệu môi trường trang trại.";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "nông nghiệp thông minh",
    "smart farm",
    "IoT cảm biến",
    "giám sát trang trại",
    "cảnh báo sâu bệnh",
    "phân tích môi trường",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
