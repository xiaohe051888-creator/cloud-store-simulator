#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies with optimization..."
# 添加优化参数：--frozen-lockfile, --no-optional
# 注意：不使用 --prod 标志，因为 Cloudflare Pages 构建需要 devDependencies
pnpm install --frozen-lockfile --no-optional --prefer-offline

echo "Building for Cloudflare Pages..."
# 临时复制生产配置
cp next.config.js next.config.js.backup

# 创建生产配置（静态导出）
cat > next.config.js << 'EOF'
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
EOF

# 构建
npx next build

echo "Moving static files to .next directory..."
# Next.js output: 'export' 输出到 out 目录
# Cloudflare Pages 期望的输出目录: .next
# 将 out 目录的内容移动到 .next
if [ -d "out" ]; then
    rm -rf .next
    mv out .next
    echo "Files moved successfully!"
else
    echo "Warning: out directory not found!"
fi

# 恢复开发配置
mv next.config.js.backup next.config.js

echo "Build completed successfully!"
