"""
管理员 API 路由
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from supabase import Client
from app.database import get_db
from app.repositories.user_repository import UserRepository
from app.dependencies import get_current_admin


router = APIRouter(prefix="/admin", tags=["管理员"])


@router.get("/users", summary="获取用户列表（管理员）")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    获取用户列表（需要管理员权限）
    
    - **page**: 页码
    - **limit**: 每页数量
    - **search**: 搜索关键词
    """
    user_repo = UserRepository(db)
    users, total = await user_repo.get_all_users(page, limit, search)
    
    # 移除密码字段
    for user in users:
        user.pop("password_hash", None)
    
    return {"users": users, "total": total, "page": page, "limit": limit}


@router.put("/users/{user_id}/status", summary="更新用户状态（管理员）")
async def update_user_status(
    user_id: str,
    status: str,
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    更新用户状态（需要管理员权限）
    
    - **user_id**: 用户 ID
    - **status**: 状态（active, banned）
    """
    user_repo = UserRepository(db)
    user = await user_repo.update_user_status(user_id, status)
    
    if not user:
        return {"success": False, "message": "用户不存在"}
    
    user.pop("password_hash", None)
    
    return {"success": True, "user": user}


@router.get("/stats", summary="获取统计数据（管理员）")
async def get_stats(
    admin_id: str = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """
    获取系统统计数据（需要管理员权限）
    """
    # NOTE: 这里可以添加更复杂的统计逻辑
    user_repo = UserRepository(db)
    users, total_users = await user_repo.get_all_users(1, 1)
    
    return {
        "total_users": total_users,
        "total_articles": 1284,  # FIXME: 从数据库获取真实数据
        "pending_reviews": 12,
        "weekly_published": 48
    }
