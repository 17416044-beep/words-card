import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "英単語クイズメーカー | 画像から和英問題を自動作成",
  description: "英文と和訳が書かれた画像をアップロードすると、赤文字部分を答えとした和英穴埋め問題を自動生成します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
