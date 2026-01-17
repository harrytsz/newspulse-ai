"""
认证 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_db, get_admin_db
from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, UserLogin, AuthResponse, UserResponse, UserUpdate
from app.dependencies import get_current_user_id
from app.repositories.user_repository import UserRepository


router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=AuthResponse, summary="用户注册")
async def register(
    user_data: UserCreate,
    db: Client = Depends(get_db)
):
    """
    用户注册接口
    
    - **email**: 用户邮箱
    - **password**: 密码
    - **name**: 用户名
    """
    auth_service = AuthService(db)
    return await auth_service.register(user_data)


@router.post("/login", response_model=AuthResponse, summary="用户登录")
async def login(
    login_data: UserLogin,
    db: Client = Depends(get_admin_db) # Fix: Use admin db to read sensitive user data (hash)
):
    """
    用户登录接口
    
    - **email**: 用户邮箱
    - **password**: 密码
    """
    auth_service = AuthService(db)
    return await auth_service.login(login_data)


@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """获取当前登录用户的信息"""
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return user


@router.put("/profile", response_model=UserResponse, summary="更新用户信息")
async def update_profile(
    update_data: UserUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
):
    """
    更新用户信息
    
    - **name**: 用户名（可选）
    - **avatar**: 头像 URL（可选）
    - **interests**: 兴趣标签列表（可选）
    """
    user_repo = UserRepository(db)
    
    # 只更新非 None 的字段
    update_dict = update_data.model_dump(exclude_unset=True)
    
    user = await user_repo.update_user(user_id, update_dict)
    
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    user.pop("password_hash", None)
    return UserResponse(**user)
