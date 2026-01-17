-- 修复 subscriptions 表的权限问题
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 启用 RLS (行级安全策略)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;

-- 3. 创建新策略
-- 允许用户查看自己的订阅
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- 允许用户创建自己的订阅
CREATE POLICY "Users can create their own subscriptions" 
ON subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的订阅
CREATE POLICY "Users can delete their own subscriptions" 
ON subscriptions FOR DELETE 
USING (auth.uid() = user_id);

-- 4. 确保 Authenticated 角色有表的操作权限
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;

-- 5. 检查是否成功
SELECT count(*) FROM subscriptions;
