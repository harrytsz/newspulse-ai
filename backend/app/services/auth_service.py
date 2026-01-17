"""
认证服务：用户注册、登录、Token 验证
"""
from typing import Optional
from fastapi import HTTPException, status
from supabase import Client
from app.repositories.user_repository import UserRepository
from app.utils.security import verify_password, create_access_token
from app.schemas.auth import UserCreate, UserLogin, UserResponse, AuthResponse


class AuthService:
    """认证服务类"""
    
    def __init__(self, db: Client):
        self.user_repo = UserRepository(db)
    
    async def register(self, user_data: UserCreate) -> AuthResponse:
        """
        用户注册
        
        Args:
            user_data: 用户注册数据
        
        Returns:
            认证响应（包含用户信息和 Token）
        
        Raises:
            HTTPException: 邮箱已存在
        """
        # 检查邮箱是否已存在
        existing_user = await self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册"
            )
        
        # 创建用户
        user = await self.user_repo.create_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        
        # 生成 Token
        token = create_access_token(data={"sub": user["id"]})
        
        # 移除密码字段
        user.pop("password_hash", None)
        
        return AuthResponse(
            user=UserResponse(**user),
            token=token
        )
    
    async def login(self, login_data: UserLogin) -> AuthResponse:
        """
        用户登录
        
        Args:
            login_data: 登录数据
        
        Returns:
            认证响应（包含用户信息和 Token）
        
        Raises:
            HTTPException: 邮箱或密码错误
        """
        # 查找用户
        try:
            user = await self.user_repo.get_user_by_email(login_data.email)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )
        
        # 验证密码
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )

        # 检查账户状态
        if user.get("status") == "banned":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="该账户已被封禁"
            )
        
        # 检查账户状态
        if user.get("status") == "banned":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="该账户已被封禁"
            )
        
        # 生成 Token
        token = create_access_token(data={"sub": user["id"]})
        
        # 移除密码字段
        user.pop("password_hash", None)
        
        return AuthResponse(
            user=UserResponse(**user),
            token=token
        )
    
    async def get_current_user(self, user_id: str) -> Optional[UserResponse]:
        """
        获取当前用户信息
        
        Args:
            user_id: 用户 ID
        
        Returns:
            用户信息
        """
        user = await self.user_repo.get_user_by_id(user_id)
        
        if not user:
            return None
        
        user.pop("password_hash", None)
        return UserResponse(**user)
