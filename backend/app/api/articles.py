"""
文章 API 路由
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from supabase import Client
from app.database import get_db
from app.services.article_service import ArticleService
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListResponse
from app.dependencies import get_current_user_id, get_current_admin
from app.repositories.user_repository import UserRepository


router = APIRouter(prefix="/articles", tags=["文章"])


@router.get("", response_model=ArticleListResponse, summary="获取文章列表")
async def get_articles(
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    db: Client = Depends(get_db)
):
    """
    获取文章列表（支持分页、筛选、搜索）
    
    - **page**: 页码（默认 1）
    - **limit**: 每页数量（默认 20）
    - **category**: 分类筛选（可选）
    - **search**: 搜索关键词（可选）
    """
    article_service = ArticleService(db)
    return await article_service.get_articles(page, limit, category, search)


@router.get("/recommended", response_model=List[ArticleResponse], summary="获取推荐文章")
async def get_recommended_articles(
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """根据用户兴趣获取推荐文章"""
    user_repo = UserRepository(db)
    user = await user_repo.get_user_by_id(user_id)
    
    user_interests = user.get("interests", []) if user else []
    
    article_service = ArticleService(db)
    return await article_service.get_recommended_articles(user_interests)


@router.get("/{article_id}", response_model=ArticleResponse, summary="获取文章详情")
async def get_article(
    article_id: str,
    db: Client = Depends(get_db)
):
    """
    获取单篇文章详情
    
    - **article_id**: 文章 ID
    """
    article_service = ArticleService(db)
    return await article_service.get_article(article_id)


@router.post("", response_model=ArticleResponse, summary="创建文章（管理员）")
async def create_article(
    article_data: ArticleCreate,
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    创建新文章（需要管理员权限）
    
    - **title**: 文章标题
    - **excerpt**: 文章摘要
    - **author**: 作者
    - **category**: 分类
    - **content**: 正文内容（可选）
    - **image_url**: 封面图片 URL（可选）
    - **images**: 多图列表（可选）
    """
    article_service = ArticleService(db)
    return await article_service.create_article(article_data)


@router.put("/{article_id}", response_model=ArticleResponse, summary="更新文章（管理员）")
async def update_article(
    article_id: str,
    update_data: ArticleUpdate,
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    更新文章（需要管理员权限）
    
    - **article_id**: 文章 ID
    """
    article_service = ArticleService(db)
    return await article_service.update_article(article_id, update_data)


@router.delete("/{article_id}", summary="删除文章（管理员）")
async def delete_article(
    article_id: str,
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    删除文章（需要管理员权限）
    
    - **article_id**: 文章 ID
    """
    article_service = ArticleService(db)
    return await article_service.delete_article(article_id)
