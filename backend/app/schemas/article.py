"""
文章相关的 Pydantic Schema
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class ArticleBase(BaseModel):
    """文章基础信息"""
    title: str
    excerpt: str
    author: str
    category: str
    source: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None


class ArticleCreate(ArticleBase):
    """创建文章请求"""
    content: Optional[str] = None
    read_time: Optional[str] = "5 分钟"
    published_date: Optional[date] = None


class ArticleUpdate(BaseModel):
    """更新文章请求"""
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None


class ArticleResponse(ArticleBase):
    """文章响应数据"""
    id: str
    content: Optional[str] = None
    read_time: str
    read_count: int
    comment_count: int
    match_score: int
    status: str
    published_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    """文章列表响应"""
    articles: List[ArticleResponse]
    total: int
    page: int
    limit: int


class ArticleSummaryRequest(BaseModel):
    """AI 摘要请求"""
    title: str
    excerpt: str


class ArticleSummaryResponse(BaseModel):
    """AI 摘要响应"""
    summary: str
