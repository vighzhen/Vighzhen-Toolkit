# 贡献指南

感谢您对 Vighzhen Toolkit 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能
- 🎨 改进 UI/UX 设计

## 开始之前

在开始贡献之前，请确保您已经：

1. 阅读了项目的 [README.md](README.md)
2. 查看了现有的 [Issues](https://github.com/vighzhen/vighzhen-toolkit/issues)
3. 了解了项目的技术栈和架构

## 开发环境设置

### 环境要求

- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 本地开发

1. **Fork 并克隆项目**
   ```bash
   git clone https://github.com/your-username/vighzhen-toolkit.git
   cd vighzhen-toolkit
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用其他包管理器
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 贡献流程

### 报告 Bug

如果您发现了 Bug，请：

1. 检查是否已有相关的 Issue
2. 如果没有，请创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤
   - 预期行为和实际行为
   - 环境信息（浏览器、操作系统等）
   - 截图或错误信息（如果适用）

### 提出功能建议

1. 检查是否已有相关的功能请求
2. 创建新的 Issue，标记为 "enhancement"
3. 详细描述功能需求和使用场景
4. 如果可能，提供设计草图或参考

### 提交代码

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **编写代码**
   - 遵循项目的代码风格
   - 添加必要的注释
   - 确保代码通过 TypeScript 检查

3. **测试**
   ```bash
   npm run lint
   npm run build
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能" # 或 "fix: 修复某个问题"
   ```

5. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 提供清晰的标题和描述
   - 关联相关的 Issue
   - 添加截图或演示（如果适用）

## 代码规范

### 文件结构

```
src/
├── app/                 # Next.js App Router
│   ├── tools/          # 工具页面
│   │   └── [tool-name]/
│   │       └── page.tsx
│   ├── layout.tsx      # 全局布局
│   └── page.tsx        # 首页
├── components/         # 可复用组件
│   └── ui/            # shadcn/ui 组件
└── lib/               # 工具函数
```

### 命名规范

- **文件名**: 使用 kebab-case（如：`jwt-decoder`）
- **组件名**: 使用 PascalCase（如：`JwtDecoder`）
- **变量名**: 使用 camelCase（如：`userName`）
- **常量名**: 使用 UPPER_SNAKE_CASE（如：`API_BASE_URL`）

### 代码风格

- 使用 TypeScript
- 使用 Biome 进行代码格式化
- 遵循 ESLint 规则
- 优先使用函数式组件和 Hooks
- 使用 Tailwind CSS 进行样式设计

### 新工具开发指南

如果您想添加新的工具，请遵循以下步骤：

1. **在 `src/app/tools/` 下创建新目录**
   ```
   src/app/tools/your-tool-name/
   └── page.tsx
   ```

2. **实现工具组件**
   - 使用现有的 UI 组件
   - 确保响应式设计
   - 添加适当的错误处理
   - 包含使用说明

3. **更新主页工具列表**
   在 `src/app/page.tsx` 中添加新工具的信息

4. **更新 README.md**
   在工具列表中添加新工具的描述

## 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加密码强度检测功能
fix: 修复 JSON 格式化工具的解析错误
docs: 更新安装说明
```

## 审查流程

1. 所有 Pull Request 都需要经过代码审查
2. 确保通过所有自动化检查
3. 至少需要一个维护者的批准
4. 合并后会自动部署到生产环境

## 获得帮助

如果您在贡献过程中遇到任何问题，可以：

- 在相关 Issue 中提问
- 发送邮件至 [vighzhen@vighzhen.cn](mailto:vighzhen@vighzhen.cn)
- 查看项目的 [Discussions](https://github.com/vighzhen/vighzhen-toolkit/discussions)

## 行为准则

请确保在参与项目时保持友善和专业的态度。我们致力于为所有贡献者创造一个包容和欢迎的环境。

---

再次感谢您的贡献！🎉