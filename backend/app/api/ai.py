"""
AI 功能 API 路由
"""
from fastapi import APIRouter
from app.services.ai_service import ai_service
from app.schemas.article import ArticleSummaryRequest, ArticleSummaryResponse


router = APIRouter(prefix="/ai", tags=["AI 功能"])


@router.post("/summarize", response_model=ArticleSummaryResponse, summary="生成文章摘要")
async def summarize_article(data: ArticleSummaryRequest):
    """
    使用 AI 生成文章深度摘要
    
    - **title**: 文章标题
    - **excerpt**: 文章摘要
    """
    summary = await ai_service.summarize_article(data.title, data.excerpt)
    
    return ArticleSummaryResponse(summary=summary)
