#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies with optimization..."
# 添加优化参数：--frozen-lockfile, --no-optional
# 注意：不使用 --prod 标志，因为 Cloudflare Pages 构建需要 devDependencies
pnpm install --frozen-lockfile --no-optional --prefer-offline

echo "Building the project with optimization..."
# 添加构建优化参数
npx next build

echo "Build completed successfully!"
