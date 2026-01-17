"""
用户交互 API 路由
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from supabase import Client
from app.database import get_db, get_admin_db
from app.repositories.interaction_repository import InteractionRepository
from app.schemas.interaction import InteractionCreate, InteractionResponse, ReadHistoryCreate, BookmarkListResponse, SubscriptionCreate, SubscriptionResponse
from app.dependencies import get_current_user_id, get_authenticated_db


router = APIRouter(prefix="/interactions", tags=["用户交互"])


@router.post("/like", response_model=InteractionResponse, summary="点赞文章")
async def like_article(
    data: InteractionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    点赞文章（再次调用则取消点赞）
    
    - **article_id**: 文章 ID
    """
    interaction_repo = InteractionRepository(db)
    result = await interaction_repo.create_interaction(user_id, data.article_id, "like")
    
    action = "取消点赞" if result.get("action") == "removed" else "点赞成功"
    
    return InteractionResponse(success=True, message=action)


@router.post("/dislike", response_model=InteractionResponse, summary="点踩文章")
async def dislike_article(
    data: InteractionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    点踩文章（再次调用则取消点踩）
    
    - **article_id**: 文章 ID
    """
    interaction_repo = InteractionRepository(db)
    result = await interaction_repo.create_interaction(user_id, data.article_id, "dislike")
    
    action = "取消点踩" if result.get("action") == "removed" else "点踩成功"
    
    return InteractionResponse(success=True, message=action)


@router.post("/bookmark", response_model=InteractionResponse, summary="收藏文章")
async def bookmark_article(
    data: InteractionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    收藏文章（再次调用则取消收藏）
    
    - **article_id**: 文章 ID
    """
    interaction_repo = InteractionRepository(db)
    result = await interaction_repo.create_interaction(user_id, data.article_id, "bookmark")
    
    action = "取消收藏" if result.get("action") == "removed" else "收藏成功"
    
    return InteractionResponse(success=True, message=action)


@router.delete("/bookmark/{article_id}", response_model=InteractionResponse, summary="取消收藏")
async def remove_bookmark(
    article_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    取消收藏文章
    
    - **article_id**: 文章 ID
    """
    interaction_repo = InteractionRepository(db)
    await interaction_repo.create_interaction(user_id, article_id, "bookmark")
    
    return InteractionResponse(success=True, message="取消收藏成功")


@router.get("/bookmarks", response_model=BookmarkListResponse, summary="获取收藏列表")
async def get_bookmarks(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    获取用户收藏的文章列表
    
    - **page**: 页码
    - **limit**: 每页数量
    """
    interaction_repo = InteractionRepository(db)
    articles, total = await interaction_repo.get_user_bookmarks(user_id, page, limit)
    
    return BookmarkListResponse(articles=articles, total=total)


@router.post("/read", response_model=InteractionResponse, summary="记录阅读历史")
async def record_reading(
    data: ReadHistoryCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    记录用户阅读历史
    
    - **article_id**: 文章 ID
    - **read_duration**: 阅读时长（秒）
    """
    interaction_repo = InteractionRepository(db)
    await interaction_repo.record_reading(user_id, data.article_id, data.read_duration)
    
    return InteractionResponse(success=True, message="阅读记录已保存")


@router.get("/history", summary="获取阅读历史")
async def get_reading_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    获取用户阅读历史
    
    - **page**: 页码
    - **limit**: 每页数量
    """
    interaction_repo = InteractionRepository(db)
    articles, total = await interaction_repo.get_reading_history(user_id, page, limit)
    
    return {"articles": articles, "total": total}


@router.post("/subscribe", response_model=InteractionResponse, summary="订阅/取消订阅")
async def toggle_subscription(
    data: SubscriptionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_admin_db)
):
    """
    订阅或取消订阅发布者
    """
    interaction_repo = InteractionRepository(db)
    result = await interaction_repo.toggle_subscription(
        user_id, 
        data.publisher_name, 
        data.publisher_avatar, 
        data.followers_count
    )
    
    action = "已取消订阅" if result.get("action") == "unsubscribed" else "订阅成功"
    
    return InteractionResponse(success=True, message=action)


@router.get("/subscriptions", response_model=List[SubscriptionResponse], summary="获取订阅列表")
async def get_subscriptions(
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_admin_db)
):
    """获取用户的订阅列表"""
    interaction_repo = InteractionRepository(db)
    return await interaction_repo.get_user_subscriptions(user_id)
