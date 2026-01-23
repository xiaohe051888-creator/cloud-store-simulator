/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，适合腾讯云 Serverless 等平台
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
  
  // 配置 Turbopack 根目录
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
