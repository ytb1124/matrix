import type { Metadata } from "next";
import "./globals.css";
import "./detail-admin.css";

export const metadata: Metadata = {
  title: "MATRIX | 공연장 검색 및 기술 DB",
  description: "홍대·합정·상수·망원 공연장의 대관료와 기술 사양을 검색하고 비교합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
