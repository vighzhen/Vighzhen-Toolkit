# 更新日志

本文档记录了 Vighzhen Toolkit 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 准备 GitHub 发布的相关文件和配置
- 🐳 **Docker 支持** - 添加完整的 Docker 容器化支持
  - 多阶段构建 Dockerfile，优化镜像体积（~20MB）
  - 基于 Nginx 的生产环境配置
  - 开发环境 Docker 配置，支持热重载
  - Docker Compose 编排文件
  - 自动包管理器检测（npm/yarn/pnpm/bun）
  - 非 root 用户运行，提升安全性
  - 健康检查和性能优化

## [1.0.0] - 2025-7-23

### 新增
- 🎉 初始版本发布
- 📋 **JSON 工具** - JSON格式化、压缩、验证
- ⏰ **时间戳转换** - 时间戳与日期相互转换
- 🔤 **编码解码** - Base64、URL编解码工具
- 🔐 **密码生成器** - 生成安全的随机密码
- 🔒 **哈希生成器** - MD5、SHA-1、SHA-256等哈希算法
- 🎫 **JWT Decoder** - 解析JWT token并展示其结构内容
- 📱 **二维码生成器** - 快速生成二维码，支持文本、链接
- 🖼️ **图片压缩** - 在线压缩图片，支持多种格式
- 📊 **文本对比** - 智能文本差异分析和对比工具
- 🧮 **计算器** - 程序员计算器，支持多进制
- 🗄️ **SmartSQL Importer** - 智能数据导入工具，支持CSV/TSV/TXT/JSON转SQL插入语句
- 🎨 **颜色工具** - 颜色格式转换和调色板
- 📝 **Markdown 编辑器** - 实时预览的Markdown编辑器
- 🎭 **ASCII Art 生成器** - 文本转ASCII艺术字

### 技术特性
- 🎨 现代化设计，采用 shadcn/ui 组件库
- 🔒 隐私保护，所有工具均在本地运行
- 📱 响应式设计，完美适配桌面端和移动端
- ⚡ 基于 Next.js 15 和 Turbopack，提供极速加载体验
- 🔍 智能搜索功能，支持快捷键搜索
- 🌙 支持明暗主题切换
- 🏷️ 分类筛选功能
- 📊 工具使用统计

### 技术栈
- **框架**: Next.js 15
- **UI 组件**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **类型检查**: TypeScript
- **代码格式化**: Biome
- **构建工具**: Turbopack

### 部署
- 🌐 支持静态站点导出
- 🚀 Netlify 部署配置
- 📦 Docker 容器化支持

---

## 版本说明

### 版本格式

版本号格式：`主版本号.次版本号.修订号`

- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

### 变更类型

- `新增` - 新功能
- `变更` - 对现有功能的变更
- `弃用` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - 问题修复
- `安全` - 安全相关的修复

### 链接

- [未发布]: https://github.com/vighzhen/vighzhen-toolkit/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/vighzhen/vighzhen-toolkit/releases/tag/v1.0.0