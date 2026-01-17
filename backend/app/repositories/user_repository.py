"""
用户数据访问层
"""
from typing import Optional, List
from supabase import Client
from app.utils.security import get_password_hash


class UserRepository:
    """用户数据访问类"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "users"
    
    async def create_user(self, email: str, password: str, name: str) -> dict:
        """
        创建新用户
        
        Args:
            email: 用户邮箱
            password: 明文密码
            name: 用户名
        
        Returns:
            创建的用户数据
        """
        password_hash = get_password_hash(password)
        
        result = self.db.table(self.table).insert({
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "role": "user",
            "status": "active",
            "interests": []
        }).execute()
        
        return result.data[0] if result.data else None
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """根据邮箱获取用户"""
        try:
            result = self.db.table(self.table).select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"DEBUG: Error fetching user by email {email}: {e}")
            raise e
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """根据 ID 获取用户"""
        result = self.db.table(self.table).select("*").eq("id", user_id).execute()
        return result.data[0] if result.data else None
    
    async def update_user(self, user_id: str, update_data: dict) -> Optional[dict]:
        """
        更新用户信息
        
        Args:
            user_id: 用户 ID
            update_data: 要更新的数据字典
        
        Returns:
            更新后的用户数据
        """
        result = self.db.table(self.table).update(update_data).eq("id", user_id).execute()
        return result.data[0] if result.data else None
    
    async def get_all_users(self, page: int = 1, limit: int = 20, search: Optional[str] = None) -> tuple[List[dict], int]:
        """
        获取用户列表（分页）
        
        Args:
            page: 页码
            limit: 每页数量
            search: 搜索关键词
        
        Returns:
            (用户列表, 总数)
        """
        offset = (page - 1) * limit
        
        query = self.db.table(self.table).select("*", count="exact")
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
        
        result = query.range(offset, offset + limit - 1).execute()
        
        return result.data, result.count
    
    async def update_user_status(self, user_id: str, status: str) -> Optional[dict]:
        """更新用户状态"""
        return await self.update_user(user_id, {"status": status})
