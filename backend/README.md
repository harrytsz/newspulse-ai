# NewsPulse AI 后端 API

基于 FastAPI + Supabase 构建的智能新闻聚合平台后端系统。

## 技术栈

- **框架**: FastAPI 0.109+
- **数据库**: Supabase (PostgreSQL)
- **认证**: JWT Token
- **AI**: Google Gemini API
- **Python**: 3.10+

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写以下配置：

- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_KEY`: Supabase Service Role Key
- `SECRET_KEY`: JWT 密钥（建议使用随机生成的强密钥）
- `GEMINI_API_KEY`: Google Gemini API Key

### 3. 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `migrations/init_db.sql` 脚本。

### 4. 运行应用

```bash
# 开发模式（自动重载）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或者直接运行
python app/main.py
```

访问 API 文档：http://localhost:8000/docs

## API 接口文档

### 认证模块 (`/api/auth`)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料

### 文章模块 (`/api/articles`)

- `GET /api/articles` - 获取文章列表（支持分页、筛选、搜索）
- `GET /api/articles/{id}` - 获取文章详情
- `GET /api/articles/recommended` - 获取推荐文章
- `POST /api/articles` - 创建文章（管理员）
- `PUT /api/articles/{id}` - 更新文章（管理员）
- `DELETE /api/articles/{id}` - 删除文章（管理员）

### 用户交互模块 (`/api/interactions`)

- `POST /api/interactions/like` - 点赞文章
- `POST /api/interactions/dislike` - 点踩文章
- `POST /api/interactions/bookmark` - 收藏文章
- `DELETE /api/interactions/bookmark/{id}` - 取消收藏
- `GET /api/interactions/bookmarks` - 获取收藏列表
- `POST /api/interactions/read` - 记录阅读历史
- `GET /api/interactions/history` - 获取阅读历史

### AI 功能模块 (`/api/ai`)

- `POST /api/ai/summarize` - 生成文章摘要

### 管理员模块 (`/api/admin`)

- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{id}/status` - 更新用户状态
- `GET /api/admin/stats` - 获取统计数据

## 项目结构

```
backend/
├── app/
│   ├── main.py              # 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── dependencies.py      # 依赖注入
│   ├── api/                 # API 路由
│   ├── services/            # 业务逻辑层
│   ├── repositories/        # 数据访问层
│   ├── schemas/             # Pydantic 模型
│   └── utils/               # 工具函数
├── migrations/              # 数据库迁移
├── tests/                   # 测试文件
├── requirements.txt         # 依赖列表
└── .env.example            # 环境变量示例
```

## 开发指南

### 代码规范

- 遵循 PEP 8 编码规范
- 使用类型注解
- 编写清晰的文档字符串
- 所有注释使用简体中文

### 测试

```bash
pytest tests/
```

## 部署

### Docker 部署（推荐）

```bash
docker build -t newspulse-api .
docker run -p 8000:8000 --env-file .env newspulse-api
```

### 云平台部署

支持部署到：
- Railway
- Render
- Fly.io
- Heroku

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到版本控制
2. 生产环境使用强密钥（`SECRET_KEY`）
3. 定期更新依赖包
4. 启用 HTTPS
5. 实施速率限制

## License

MIT License
