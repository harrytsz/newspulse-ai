"""
用户相关的 Pydantic Schema
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    """用户基础信息"""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """用户注册请求"""
    password: str


class UserLogin(BaseModel):
    """用户登录请求"""
    email: str
    password: str


class UserUpdate(BaseModel):
    """用户信息更新请求"""
    name: Optional[str] = None
    avatar: Optional[str] = None
    interests: Optional[List[str]] = None


class UserResponse(UserBase):
    """用户响应数据"""
    id: str
    avatar: Optional[str] = None
    role: str
    status: str
    interests: List[str] = []
    join_date: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AuthResponse(BaseModel):
    """认证响应"""
    user: UserResponse
    token: str
