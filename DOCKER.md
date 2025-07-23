# 🐳 Docker 部署指南

本文档详细介绍如何使用 Docker 部署 Vighzhen Toolkit。

## 📋 前置要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本
- 至少 1GB 可用磁盘空间

## 🚀 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/vighzhen/vighzhen-toolkit.git
cd vighzhen-toolkit

# 启动生产环境
docker-compose up -d

# 访问应用
open http://localhost:3000
```

### 方式二：手动构建

```bash
# 构建镜像
docker build -t vighzhen-toolkit .

# 运行容器
docker run -d -p 3000:8080 --name vighzhen-toolkit vighzhen-toolkit

# 访问应用
open http://localhost:3000
```

## 🛠️ 详细配置

### 生产环境部署

```bash
# 启动生产环境
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 开发环境部署

```bash
# 启动开发环境（支持热重载）
docker-compose --profile dev up -d vighzhen-toolkit-dev

# 访问开发环境
open http://localhost:3001

# 查看开发环境日志
docker-compose logs -f vighzhen-toolkit-dev
```

### 带反向代理部署

```bash
# 启动带 Nginx 反向代理的完整环境
docker-compose --profile proxy up -d

# 访问应用（通过代理）
open http://localhost
```

## 📁 文件结构

```
.
├── Dockerfile              # 生产环境多阶段构建
├── Dockerfile.dev          # 开发环境配置
├── docker-compose.yml      # Docker Compose 编排
├── nginx.conf              # Nginx 配置文件
├── .dockerignore           # Docker 忽略文件
└── DOCKER.md               # 本文档
```

## ⚙️ 配置说明

### Dockerfile 特性

- **多阶段构建**：分离构建和运行环境
- **自动包管理器检测**：支持 npm/yarn/pnpm/bun
- **安全优化**：非 root 用户运行
- **体积优化**：最终镜像约 20MB
- **健康检查**：自动监控应用状态

### Nginx 配置

- **SPA 支持**：正确处理前端路由
- **静态资源缓存**：优化加载性能
- **Gzip 压缩**：减少传输大小
- **安全头**：增强安全性
- **CORS 支持**：跨域请求处理

### Docker Compose 服务

| 服务名 | 端口 | 描述 |
|--------|------|------|
| vighzhen-toolkit | 3000:8080 | 生产环境服务 |
| vighzhen-toolkit-dev | 3001:3000 | 开发环境服务 |
| nginx-proxy | 80:80, 443:443 | 反向代理服务 |

## 🔧 自定义配置

### 环境变量

```bash
# 在 docker-compose.yml 中添加环境变量
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  - CUSTOM_VAR=value
```

### 端口映射

```bash
# 修改端口映射
ports:
  - "8080:8080"  # 自定义外部端口
```

### 数据持久化

```bash
# 添加数据卷
volumes:
  - ./data:/app/data
  - ./logs:/var/log/nginx
```

## 🔍 故障排除

### 常见问题

**1. 端口冲突**
```bash
# 检查端口占用
lsof -i :3000

# 修改端口映射
docker-compose up -d --force-recreate
```

**2. 构建失败**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

**3. 容器无法启动**
```bash
# 查看详细日志
docker-compose logs vighzhen-toolkit

# 检查容器状态
docker-compose ps
```

### 调试命令

```bash
# 进入容器
docker-compose exec vighzhen-toolkit sh

# 查看容器资源使用
docker stats

# 检查网络连接
docker network ls
docker network inspect vighzhen-network
```

## 📊 性能优化

### 镜像优化

- 使用 Alpine Linux 基础镜像
- 多阶段构建减少镜像体积
- 合并 RUN 指令减少层数
- 使用 .dockerignore 排除不必要文件

### 运行时优化

- Nginx 静态文件缓存
- Gzip 压缩减少传输
- 健康检查监控状态
- 资源限制防止过载

### 监控建议

```bash
# 添加资源限制
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 🔒 安全最佳实践

1. **非 root 用户运行**
   - 容器内使用 nextjs 用户
   - 最小权限原则

2. **网络安全**
   - 使用自定义网络
   - 限制容器间通信

3. **镜像安全**
   - 定期更新基础镜像
   - 扫描安全漏洞

4. **配置安全**
   - 不在镜像中包含敏感信息
   - 使用 secrets 管理密钥

## 🚀 生产部署建议

### 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml vighzhen
```

### 使用 Kubernetes

```bash
# 生成 Kubernetes 配置
kompose convert

# 部署到 Kubernetes
kubectl apply -f .
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build and push Docker image
  uses: docker/build-push-action@v2
  with:
    context: .
    push: true
    tags: vighzhen/toolkit:latest
```

## 📞 支持

如果您在使用 Docker 部署时遇到问题：

1. 查看本文档的故障排除部分
2. 检查 [GitHub Issues](https://github.com/vighzhen/vighzhen-toolkit/issues)
3. 创建新的 Issue 并提供详细信息

---

**提示**：建议在生产环境中使用具体的版本标签而不是 `latest`，以确保部署的一致性和可预测性。