import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI & 물류 자동화 뉴스",
  description: "AI 및 물류 자동화 최신 뉴스를 실시간으로 제공합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-slate-900 text-slate-100">{children}</body>
    </html>
  );
}
