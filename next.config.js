/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用符号链接，Cloudflare Pages不支持
  experimental: {
    disableSymlinks: true,
  },
  images: {
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
