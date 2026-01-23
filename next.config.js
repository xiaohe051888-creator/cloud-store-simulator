/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出配置，使用标准 SSR 模式
  // output: 'export',
  
  // 图片优化配置
  images: {
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
