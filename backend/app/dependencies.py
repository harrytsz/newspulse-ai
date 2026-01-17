"""
依赖注入：认证中间件和数据库连接
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database import get_db
from app.utils.security import decode_access_token
from app.repositories.user_repository import UserRepository


# HTTP Bearer Token 认证
security = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    从 Token 中获取当前用户 ID
    
    Args:
        credentials: HTTP Bearer Token
    
    Returns:
        用户 ID
    
    Raises:
        HTTPException: Token 无效
    """
    if not credentials:
        print("DEBUG: No Authorization header provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="需要身份验证",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    print(f"DEBUG: Validating token: {token[:10]}...")
    
    # 解码 Token
    payload = decode_access_token(token)
    
    if not payload:
        print("DEBUG: Token validation failed (decode returned None)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG: Token payload: {payload}")
    user_id: str = payload.get("sub")
    
    if not user_id:
        print("DEBUG: No sub (user_id) in payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG: User authenticated: {user_id}")
    return user_id


async def get_current_admin(
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db)
) -> str:
    """
    验证当前用户是否为管理员
    
    Args:
        user_id: 用户 ID
        db: 数据库客户端
    
    Returns:
        用户 ID
    
    Raises:
        HTTPException: 用户不是管理员
    """
    # 这里我们使用 get_db (Anon Key) 来检查，假设 users 表对 authenticated 用户可见
    # 如果 users 表有严格 RLS，可能需要调整
    user_repo = UserRepository(db)
    user = await user_repo.get_user_by_id(user_id)
    
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要管理员权限"
        )
    
    return user_id


async def get_authenticated_db(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Client:
    """
    获取经过身份验证的 Supabase 客户端
    使用用户的 JWT Token 初始化客户端，确保遵守 RLS 策略
    """
    token = credentials.credentials
    
    # 验证 Token 是否有效
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )
        
    # 创建带 Auth Header 的客户端
    # 注意：这里我们使用 Client 而不是 create_client，因为不想创建单例
    # 但 supabase-py 的 create_client 是工厂方法
    from supabase import create_client
    from app.config import settings
    
    client = create_client(
        settings.supabase_url,
        settings.supabase_key,
        options={'headers': {'Authorization': f'Bearer {token}'}}
    )
    
    return client
