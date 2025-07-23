#!/bin/bash

# Vighzhen Toolkit 部署脚本
# 用于快速构建和部署项目

set -e  # 遇到错误时退出

echo "🚀 开始部署 Vighzhen Toolkit..."

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ 错误: 需要 Node.js 18 或更高版本，当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js 版本检查通过: $(node -v)"

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf .next out dist

# 安装依赖
echo "📦 安装依赖..."
if command -v bun &> /dev/null; then
    echo "使用 Bun 安装依赖..."
    bun install
elif command -v pnpm &> /dev/null; then
    echo "使用 pnpm 安装依赖..."
    pnpm install
elif command -v yarn &> /dev/null; then
    echo "使用 Yarn 安装依赖..."
    yarn install
else
    echo "使用 npm 安装依赖..."
    npm install
fi

# 运行代码检查
echo "🔍 运行代码检查..."
if command -v bun &> /dev/null; then
    bun run lint
else
    npm run lint
fi

# 构建项目
echo "🏗️ 构建项目..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

# 检查构建结果
if [ -d "out" ]; then
    echo "✅ 构建成功！静态文件已生成到 'out' 目录"
    echo "📊 构建统计:"
    echo "   - 文件数量: $(find out -type f | wc -l)"
    echo "   - 目录大小: $(du -sh out | cut -f1)"
else
    echo "❌ 构建失败！未找到 'out' 目录"
    exit 1
fi

# 部署选项
echo ""
echo "🎉 构建完成！现在您可以选择部署方式:"
echo ""
echo "1. 📁 本地预览:"
echo "   npx serve out"
echo ""
echo "2. 🐳 Docker 部署:"
echo "   # 快速启动（推荐）"
echo "   docker-compose up -d"
echo "   "
echo "   # 手动构建"
echo "   docker build -t vighzhen-toolkit ."
echo "   docker run -d -p 3000:8080 --name vighzhen-toolkit vighzhen-toolkit"
echo "   "
echo "   # 开发环境"
echo "   docker-compose --profile dev up -d vighzhen-toolkit-dev"
echo ""
echo "3. 🌐 Netlify 部署:"
echo "   - 将 'out' 目录拖拽到 https://app.netlify.com/drop"
echo "   - 或使用 Netlify CLI: netlify deploy --prod --dir=out"
echo ""
echo "4. 📡 Vercel 部署:"
echo "   vercel --prod"
echo ""
echo "5. 🐙 GitHub Pages:"
echo "   - 将 'out' 目录内容推送到 gh-pages 分支"
echo "   - 或使用 GitHub Actions 自动部署"
echo ""
echo "6. 🔗 其他静态托管服务:"
echo "   - 将 'out' 目录上传到任何静态文件托管服务"
echo ""

# 可选：自动打开本地预览
read -p "是否启动本地预览服务器？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 启动本地预览服务器..."
    if command -v npx &> /dev/null; then
        npx serve out
    else
        echo "❌ 未找到 npx，请手动运行: npx serve out"
    fi
fi

echo "✨ 部署脚本执行完成！"