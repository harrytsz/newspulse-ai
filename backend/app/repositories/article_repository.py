"""
文章数据访问层
"""
from typing import Optional, List
from supabase import Client
from datetime import date


class ArticleRepository:
    """文章数据访问类"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "articles"
    
    async def create_article(self, article_data: dict) -> dict:
        """
        创建文章
        
        Args:
            article_data: 文章数据字典
        
        Returns:
            创建的文章数据
        """
        # 设置默认值
        if "status" not in article_data:
            article_data["status"] = "published"
        if "read_count" not in article_data:
            article_data["read_count"] = 0
        if "comment_count" not in article_data:
            article_data["comment_count"] = 0
        if "match_score" not in article_data:
            article_data["match_score"] = 90
        if "published_date" not in article_data:
            article_data["published_date"] = str(date.today())
        
        result = self.db.table(self.table).insert(article_data).execute()
        return result.data[0] if result.data else None
    
    async def get_article_by_id(self, article_id: str) -> Optional[dict]:
        """根据 ID 获取文章"""
        result = self.db.table(self.table).select("*").eq("id", article_id).execute()
        return result.data[0] if result.data else None
    
    async def get_articles(
        self, 
        page: int = 1, 
        limit: int = 20, 
        category: Optional[str] = None,
        search: Optional[str] = None,
        status: str = "published"
    ) -> tuple[List[dict], int]:
        """
        获取文章列表（分页、筛选）
        
        Args:
            page: 页码
            limit: 每页数量
            category: 分类筛选
            search: 搜索关键词
            status: 文章状态
        
        Returns:
            (文章列表, 总数)
        """
        offset = (page - 1) * limit
        
        query = self.db.table(self.table).select("*", count="exact").eq("status", status)
        
        if category:
            query = query.eq("category", category)
        
        if search:
            query = query.or_(f"title.ilike.%{search}%,author.ilike.%{search}%")
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return result.data, result.count
    
    async def update_article(self, article_id: str, update_data: dict) -> Optional[dict]:
        """
        更新文章
        
        Args:
            article_id: 文章 ID
            update_data: 要更新的数据
        
        Returns:
            更新后的文章数据
        """
        result = self.db.table(self.table).update(update_data).eq("id", article_id).execute()
        return result.data[0] if result.data else None
    
    async def delete_article(self, article_id: str) -> bool:
        """
        删除文章
        
        Args:
            article_id: 文章 ID
        
        Returns:
            是否删除成功
        """
        result = self.db.table(self.table).delete().eq("id", article_id).execute()
        return len(result.data) > 0
    
    async def increment_read_count(self, article_id: str) -> None:
        """增加文章阅读次数"""
        article = await self.get_article_by_id(article_id)
        if article:
            new_count = article.get("read_count", 0) + 1
            await self.update_article(article_id, {"read_count": new_count})
    
    async def get_recommended_articles(self, user_interests: List[str], limit: int = 10) -> List[dict]:
        """
        获取推荐文章（基于用户兴趣）
        
        Args:
            user_interests: 用户兴趣标签列表
            limit: 返回数量
        
        Returns:
            推荐文章列表
        """
        if not user_interests:
            # 如果没有兴趣标签，返回热门文章
            result = self.db.table(self.table).select("*").eq("status", "published").order("read_count", desc=True).limit(limit).execute()
            return result.data
        
        # 根据兴趣标签匹配分类
        query = self.db.table(self.table).select("*").eq("status", "published")
        
        # NOTE: Supabase 的 in_ 方法用于匹配分类
        result = query.in_("category", user_interests).order("created_at", desc=True).limit(limit).execute()
        
        return result.data
