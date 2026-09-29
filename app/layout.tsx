import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printlens 澄数",
  description: "透明可验证的 AI 经济日历：每个影响分都能看到计算过程与样本量。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
