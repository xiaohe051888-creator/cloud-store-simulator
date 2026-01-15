import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf3-static.bytednsdoc.com',
        pathname: '/**',
      },
    ],
  },
  // 构建优化
  compress: true,
  // 减少构建输出
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
