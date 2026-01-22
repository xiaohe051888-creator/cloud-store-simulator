#!/bin/bash

# Vercel 部署自动化脚本
# 作者: Matrix Agent
# 用途: 一键部署 Next.js 网站到 Vercel（无水印）

set -e

echo "================================"
echo "🚀 开始部署到 Vercel"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤 1: 导航到项目目录
echo -e "${BLUE}📁 步骤 1/4: 进入项目目录${NC}"
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "   项目路径: $PROJECT_DIR"
echo ""

# 步骤 2: 检查 Git 状态并推送
echo -e "${BLUE}🔄 步骤 2/4: 推送代码到 GitHub${NC}"
echo "   检查 Git 状态..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "   发现更改，正在提交..."
    git add -A
    git commit -m "配置 Vercel 自动部署 $(date '+%Y-%m-%d %H:%M')" || true
    echo "   ✓ 更改已提交"
else
    echo "   ✓ 没有新更改"
fi

# 检查远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  未配置远程仓库，需要手动配置${NC}"
    echo "   请执行以下命令："
    echo "   git remote add origin https://github.com/xiaohe051888-creator/cloud-store-simulator.git"
    echo ""
    read -p "   是否已配置远程仓库并准备好推送？(y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo -e "${RED}❌ 部署取消${NC}"
        exit 1
    fi
fi

echo "   正在推送到 GitHub..."
git push origin main || {
    echo -e "${YELLOW}⚠️  推送失败，可能是需要认证${NC}"
    echo ""
    echo "   请在弹出的窗口中登录 GitHub，然后重试"
    echo ""
    read -p "   按 Enter 键继续尝试推送..."
    git push origin main
}
echo "   ✓ 代码已推送到 GitHub"
echo ""

# 步骤 3: 引导用户配置 Vercel
echo -e "${BLUE}🌐 步骤 3/4: 配置 Vercel${NC}"
echo ""
echo "   请在浏览器中完成以下操作："
echo ""
echo "   1️⃣  打开: https://vercel.com"
echo "   2️⃣  使用 GitHub 账号登录"
echo "   3️⃣  点击 'Add New Project'"
echo "   4️⃣  选择导入仓库: xiaohe051888-creator/cloud-store-simulator"
echo "   5️⃣  Vercel 会自动检测 Next.js 配置"
echo "   6️⃣  点击 'Deploy' 按钮"
echo ""
echo "   ⏳ 等待部署完成..."
echo ""
read -p "   部署完成后按 Enter 键继续..."

# 步骤 4: 完成
echo ""
echo -e "${BLUE}✅ 步骤 4/4: 部署完成${NC}"
echo ""
echo "   🎉 恭喜！您的网站应该已经部署成功！"
echo ""
echo "   访问您的网站："
echo "   - 在 Vercel 项目页面查看部署状态"
echo "   - 点击 'Visit' 按钮打开网站"
echo ""
echo "   新域名格式类似：https://cloud-store-simulator.vercel.app"
echo ""
echo "   ⚠️  重要提醒："
echo "   - 这是全新部署，新域名与旧域名不同"
echo "   - 分享链接会自动使用新域名"
echo "   - 完全无水印！✅"
echo ""
echo "================================"
echo "✨ 部署完成！"
echo "================================"
