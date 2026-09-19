import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAGE INDEX | 홍대 공연장 기술 DB",
  description: "홍대·합정·상수 공연장의 대관료와 기술 사양을 검색하고 비교합니다.",
  other: {
    "codex-preview": "development",
  },
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
