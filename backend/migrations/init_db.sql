-- NewsPulse AI 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  interests TEXT[] DEFAULT '{}',
  join_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 文章表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  source VARCHAR(100),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  read_time VARCHAR(20) DEFAULT '5 分钟',
  read_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  match_score INTEGER DEFAULT 90,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 用户交互表
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'bookmark', 'read')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, article_id, interaction_type)
);

-- 4. 阅读历史表
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  read_duration INTEGER DEFAULT 0,
  read_at TIMESTAMP DEFAULT NOW()
);

-- 5. 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  publisher_name VARCHAR(100) NOT NULL,
  publisher_avatar TEXT,
  followers_count VARCHAR(20),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, publisher_name)
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON reading_history(read_at DESC);

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入测试数据（可选）
-- 创建管理员用户（密码: admin123，需要使用 bcrypt 加密）
INSERT INTO users (email, password_hash, name, role, interests) VALUES
('admin@newspulse.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHaSuu', 'Admin User', 'admin', ARRAY['科技', '金融', '国际'])
ON CONFLICT (email) DO NOTHING;

-- 插入示例文章
INSERT INTO articles (title, excerpt, author, category, source, image_url, images, read_time, read_count, comment_count, match_score, published_date) VALUES
('硅悖论：为什么量子技术突破比预期提前了 5 年？', '探索从开放式办公区的嘈杂到专注于声学舱和禅意冥想空间的转变。随着技术的不断演进，我们正处于一个信息爆炸的时代。', '连线杂志', '科技', '连线杂志', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', ARRAY['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'], '8 分钟', 12540, 156, 98, '2024-03-20'),
('华尔街的新型预测算法解析', '利用人工智能重塑现代金融市场的交易逻辑。', '金融周刊', '金融', '彭博社', 'https://images.unsplash.com/photo-1611974717483-5828fd165509?auto=format&fit=crop&q=80&w=800', ARRAY['https://images.unsplash.com/photo-1611974717483-5828fd165509?auto=format&fit=crop&q=80&w=800'], '12 分钟', 8420, 89, 94, '2024-03-19'),
('数据驱动选拔：足球运动的未来', '如何通过大数据分析提升球队的竞争优势。', '体育观察', '体育', 'ESPN', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800', '{}', '10 分钟', 5120, 42, 91, '2024-03-18')
ON CONFLICT DO NOTHING;

-- 完成
SELECT 'Database initialization completed successfully!' AS status;
