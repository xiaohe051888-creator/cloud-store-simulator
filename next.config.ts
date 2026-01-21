import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  output: 'export', // 静态导出
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf3-static.bytednsdoc.com',
        pathname: '/**',
      },
    ],
    unoptimized: true, // 静态导出需要禁用图片优化
  },
  // 构建优化
  compress: true,
  // 减少构建输出
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
