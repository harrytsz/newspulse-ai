"""
文章服务：文章管理业务逻辑
"""
from typing import Optional, List
from fastapi import HTTPException, status
from supabase import Client
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListResponse


class ArticleService:
    """文章服务类"""
    
    def __init__(self, db: Client):
        self.article_repo = ArticleRepository(db)
    
    async def create_article(self, article_data: ArticleCreate) -> ArticleResponse:
        """
        创建文章
        
        Args:
            article_data: 文章数据
        
        Returns:
            创建的文章
        """
        article_dict = article_data.model_dump()
        article = await self.article_repo.create_article(article_dict)
        
        return ArticleResponse(**article)
    
    async def get_article(self, article_id: str) -> ArticleResponse:
        """
        获取文章详情
        
        Args:
            article_id: 文章 ID
        
        Returns:
            文章详情
        
        Raises:
            HTTPException: 文章不存在
        """
        article = await self.article_repo.get_article_by_id(article_id)
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文章不存在"
            )
        
        # 增加阅读次数
        await self.article_repo.increment_read_count(article_id)
        
        return ArticleResponse(**article)
    
    async def get_articles(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> ArticleListResponse:
        """
        获取文章列表
        
        Args:
            page: 页码
            limit: 每页数量
            category: 分类筛选
            search: 搜索关键词
        
        Returns:
            文章列表响应
        """
        articles, total = await self.article_repo.get_articles(
            page=page,
            limit=limit,
            category=category,
            search=search
        )
        
        return ArticleListResponse(
            articles=[ArticleResponse(**article) for article in articles],
            total=total,
            page=page,
            limit=limit
        )
    
    async def update_article(self, article_id: str, update_data: ArticleUpdate) -> ArticleResponse:
        """
        更新文章
        
        Args:
            article_id: 文章 ID
            update_data: 更新数据
        
        Returns:
            更新后的文章
        
        Raises:
            HTTPException: 文章不存在
        """
        # 检查文章是否存在
        existing = await self.article_repo.get_article_by_id(article_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文章不存在"
            )
        
        # 只更新非 None 的字段
        update_dict = update_data.model_dump(exclude_unset=True)
        
        article = await self.article_repo.update_article(article_id, update_dict)
        
        return ArticleResponse(**article)
    
    async def delete_article(self, article_id: str) -> dict:
        """
        删除文章
        
        Args:
            article_id: 文章 ID
        
        Returns:
            删除结果
        
        Raises:
            HTTPException: 文章不存在
        """
        success = await self.article_repo.delete_article(article_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文章不存在"
            )
        
        return {"success": True, "message": "文章已删除"}
    
    async def get_recommended_articles(self, user_interests: List[str]) -> List[ArticleResponse]:
        """
        获取推荐文章
        
        Args:
            user_interests: 用户兴趣标签
        
        Returns:
            推荐文章列表
        """
        articles = await self.article_repo.get_recommended_articles(user_interests)
        
        return [ArticleResponse(**article) for article in articles]
