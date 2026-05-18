import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Farm Monitoring System",
  description: "He thong giam sat nong trai thong minh cho do an INT1334."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
