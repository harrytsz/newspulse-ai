"""
用户交互数据访问层
"""
from typing import List, Optional
from supabase import Client


class InteractionRepository:
    """用户交互数据访问类"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "user_interactions"
        self.history_table = "reading_history"
    
    async def create_interaction(self, user_id: str, article_id: str, interaction_type: str) -> dict:
        """
        创建用户交互记录
        
        Args:
            user_id: 用户 ID
            article_id: 文章 ID
            interaction_type: 交互类型（like, dislike, bookmark）
        
        Returns:
            创建的交互记录
        """
        # 先检查是否已存在
        existing = await self.get_interaction(user_id, article_id, interaction_type)
        
        if existing:
            # 如果已存在，删除（取消操作）
            self.db.table(self.table).delete().eq("id", existing["id"]).execute()
            return {"action": "removed"}
        else:
            # 创建新记录
            result = self.db.table(self.table).insert({
                "user_id": user_id,
                "article_id": article_id,
                "interaction_type": interaction_type
            }).execute()
            return result.data[0] if result.data else None
    
    async def get_interaction(self, user_id: str, article_id: str, interaction_type: str) -> Optional[dict]:
        """获取特定交互记录"""
        result = self.db.table(self.table).select("*").eq("user_id", user_id).eq("article_id", article_id).eq("interaction_type", interaction_type).execute()
        return result.data[0] if result.data else None
    
    async def get_user_bookmarks(self, user_id: str, page: int = 1, limit: int = 20) -> tuple[List[dict], int]:
        """
        获取用户收藏的文章列表
        
        Args:
            user_id: 用户 ID
            page: 页码
            limit: 每页数量
        
        Returns:
            (文章列表, 总数)
        """
        offset = (page - 1) * limit
        
        # 联表查询：获取收藏的文章详情
        result = self.db.table(self.table).select(
            "*, articles(*)", 
            count="exact"
        ).eq("user_id", user_id).eq("interaction_type", "bookmark").range(offset, offset + limit - 1).execute()
        
        # 提取文章数据
        articles = [item.get("articles") for item in result.data if item.get("articles")]
        
        return articles, result.count
    
    async def record_reading(self, user_id: str, article_id: str, read_duration: int) -> dict:
        """
        记录阅读历史
        
        Args:
            user_id: 用户 ID
            article_id: 文章 ID
            read_duration: 阅读时长（秒）
        
        Returns:
            创建的阅读记录
        """
        result = self.db.table(self.history_table).insert({
            "user_id": user_id,
            "article_id": article_id,
            "read_duration": read_duration
        }).execute()
        
        return result.data[0] if result.data else None
    
    async def get_reading_history(self, user_id: str, page: int = 1, limit: int = 20) -> tuple[List[dict], int]:
        """
        获取用户阅读历史
        
        Args:
            user_id: 用户 ID
            page: 页码
            limit: 每页数量
        
        Returns:
            (文章列表, 总数)
        """
        offset = (page - 1) * limit
        
        result = self.db.table(self.history_table).select(
            "*, articles(*)", 
            count="exact"
        ).eq("user_id", user_id).order("read_at", desc=True).range(offset, offset + limit - 1).execute()
        
        articles = [item.get("articles") for item in result.data if item.get("articles")]
        
        return articles, result.count

    async def toggle_subscription(self, user_id: str, publisher_name: str, publisher_avatar: str = None, followers_count: str = None) -> dict:
        """
        切换订阅状态（订阅/取消订阅）
        """
        # 检查是否已订阅
        existing = self.db.table("subscriptions").select("*").eq("user_id", user_id).eq("publisher_name", publisher_name).execute()
        
        if existing.data:
            # 取消订阅
            self.db.table("subscriptions").delete().eq("id", existing.data[0]["id"]).execute()
            return {"action": "unsubscribed"}
        else:
            # 订阅
            data = {
                "user_id": user_id,
                "publisher_name": publisher_name,
                "publisher_avatar": publisher_avatar,
                "followers_count": followers_count
            }
            self.db.table("subscriptions").insert(data).execute()
            return {"action": "subscribed"}

    async def get_user_subscriptions(self, user_id: str) -> List[dict]:
        """获取用户订阅列表"""
        result = self.db.table("subscriptions").select("*").eq("user_id", user_id).order("subscribed_at", desc=True).execute()
        return result.data if result.data else []
