# NewsPulse AI - 完整部署指南

## 📋 目录

1. [环境准备](#环境准备)
2. [Supabase 配置](#supabase-配置)
3. [后端部署](#后端部署)
4. [前端配置](#前端配置)
5. [测试验证](#测试验证)
6. [常见问题](#常见问题)

---

## 环境准备

### 必需工具

- **Python**: 3.10 或更高版本
- **Node.js**: 16 或更高版本
- **npm**: 8 或更高版本
- **Supabase 账号**: [注册地址](https://supabase.com)
- **Google Gemini API Key**: [获取地址](https://ai.google.dev/)

---

## Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: newspulse-ai
   - **Database Password**: 设置强密码（请记住）
   - **Region**: 选择离你最近的区域
4. 等待项目创建完成（约 2 分钟）

### 2. 获取 API 密钥

在项目 Dashboard 中：

1. 点击左侧菜单 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: 公开密钥
   - **service_role**: 服务密钥（⚠️ 保密）

### 3. 执行数据库迁移

1. 在 Supabase Dashboard 中，点击左侧菜单 "SQL Editor"
2. 点击 "New Query"
3. 复制 `backend/migrations/init_db.sql` 的全部内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行脚本
6. 确认看到成功消息：`Database initialization completed successfully!`

### 4. 验证数据库表

在 "Table Editor" 中应该能看到以下表：

- ✅ users
- ✅ articles
- ✅ user_interactions
- ✅ reading_history
- ✅ subscriptions

---

## 后端部署

### 1. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写以下配置：

```env
# Supabase 配置（从 Supabase Dashboard 获取）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT 配置（生成随机密钥）
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# 应用配置
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
API_PREFIX=/api
```

**生成安全的 SECRET_KEY**：

```python
# 在 Python 中运行
import secrets
print(secrets.token_urlsafe(32))
```

### 3. 启动后端服务

```bash
# 开发模式（自动重载）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或者
python app/main.py
```

### 4. 验证后端运行

访问以下 URL：

- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

应该看到 Swagger UI 文档界面。

---

## 前端配置

### 1. 安装前端依赖

```bash
cd ..  # 回到项目根目录
npm install
```

### 2. 配置前端环境变量

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 3. 启动前端开发服务器

```bash
npm run dev
```

访问：http://localhost:5173

---

## 测试验证

### 1. 测试用户注册和登录

#### 使用 API 文档测试

1. 访问 http://localhost:8000/docs
2. 找到 `POST /api/auth/register`
3. 点击 "Try it out"
4. 填写测试数据：

```json
{
  "email": "test@example.com",
  "password": "test123456",
  "name": "Test User"
}
```

5. 点击 "Execute"
6. 应该返回 200 状态码和用户信息 + Token

#### 使用前端界面测试

1. 访问 http://localhost:5173
2. 在登录页面点击注册
3. 填写注册信息
4. 提交后应该自动登录

### 2. 测试文章功能

#### 创建测试文章（管理员）

数据库已预置管理员账号：

- **邮箱**: admin@newspulse.com
- **密码**: admin123

1. 使用管理员账号登录
2. 访问 "内容管理" 页面
3. 点击 "创建新文章"
4. 填写文章信息并发布

#### 获取文章列表

```bash
# 使用 curl 测试
curl http://localhost:8000/api/articles
```

### 3. 测试 AI 摘要功能

1. 在文章详情页面
2. 点击 "生成 AI 深度摘要"
3. 应该看到 AI 生成的摘要内容

---

## 常见问题

### Q1: Supabase 连接失败

**错误**: `Connection refused` 或 `Invalid API key`

**解决方案**:
1. 检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 确认 Supabase 项目状态为 "Active"
3. 检查网络连接

### Q2: JWT Token 验证失败

**错误**: `Invalid authentication credentials`

**解决方案**:
1. 确保 `SECRET_KEY` 在前后端一致
2. 检查 Token 是否过期
3. 清除浏览器 localStorage 重新登录

### Q3: CORS 错误

**错误**: `Access to XMLHttpRequest has been blocked by CORS policy`

**解决方案**:
1. 检查后端 `.env` 中的 `CORS_ORIGINS` 是否包含前端地址
2. 确保前端使用的端口与配置一致

### Q4: Gemini API 调用失败

**错误**: `AI 摘要生成错误`

**解决方案**:
1. 检查 `GEMINI_API_KEY` 是否有效
2. 确认 API 配额未超限
3. 检查网络是否能访问 Google AI 服务

### Q5: 数据库表不存在

**错误**: `relation "users" does not exist`

**解决方案**:
1. 重新执行 `migrations/init_db.sql` 脚本
2. 检查 Supabase 项目是否正常运行
3. 确认使用的是正确的数据库连接

---

## 生产环境部署建议

### 后端部署

**推荐平台**:
- Railway (https://railway.app)
- Render (https://render.com)
- Fly.io (https://fly.io)

**部署步骤**:
1. 将代码推送到 GitHub
2. 在平台上连接 GitHub 仓库
3. 配置环境变量
4. 设置启动命令：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 前端部署

**推荐平台**:
- Vercel (https://vercel.com)
- Netlify (https://netlify.com)

**部署步骤**:
1. 将代码推送到 GitHub
2. 在平台上导入项目
3. 配置环境变量
4. 自动构建和部署

### 安全检查清单

- [ ] 更改所有默认密码
- [ ] 使用强随机 `SECRET_KEY`
- [ ] 启用 HTTPS
- [ ] 配置速率限制
- [ ] 定期备份数据库
- [ ] 监控 API 使用情况
- [ ] 设置日志记录

---

## 技术支持

如有问题，请查看：

- **API 文档**: http://localhost:8000/docs
- **Supabase 文档**: https://supabase.com/docs
- **FastAPI 文档**: https://fastapi.tiangolo.com

---

**祝部署顺利！🚀**
