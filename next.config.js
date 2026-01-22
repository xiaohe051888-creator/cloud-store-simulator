/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，适用于 Cloudflare Pages
  output: 'export',
  // 静态导出时禁用图片优化
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf3-static.bytednsdoc.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
