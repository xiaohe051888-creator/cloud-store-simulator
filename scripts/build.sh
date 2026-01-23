#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies with optimization..."
# 添加优化参数：--frozen-lockfile, --no-optional
pnpm install --frozen-lockfile --no-optional --prefer-offline

echo "Building for Vercel..."
# 直接使用 next build，不修改配置文件
# Vercel 会自动处理 Next.js 配置
npx next build

echo "Build completed successfully!"
