#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies with optimization..."
# 添加优化参数：--frozen-lockfile, --prod (忽略 devDependencies), --no-optional
pnpm install --frozen-lockfile --prod --no-optional --prefer-offline

echo "Building the project with optimization..."
# 添加构建优化参数
npx next build

echo "Build completed successfully!"
