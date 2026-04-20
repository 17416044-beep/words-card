import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 大きな画像ファイルのアップロードに対応
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // API ルートのボディサイズ制限を増やす
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} as NextConfig;

export default nextConfig;
