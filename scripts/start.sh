#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    # 使用 serve 来托管静态文件（next export 输出到 out 目录）
    npx serve@latest out -p ${DEPLOY_RUN_PORT} --no-clipboard
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
