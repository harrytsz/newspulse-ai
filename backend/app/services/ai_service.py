"""
AI 服务：文章摘要生成和语音合成
"""
import google.generativeai as genai
from app.config import settings


class AIService:
    """AI 服务类"""
    
    def __init__(self):
        """初始化 Gemini AI"""
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def summarize_article(self, title: str, excerpt: str) -> str:
        """
        生成文章摘要
        
        Args:
            title: 文章标题
            excerpt: 文章摘要
        
        Returns:
            AI 生成的深度摘要
        """
        try:
            prompt = f"""请总结以下新闻文章的深度价值，用两三句话概括：
标题：{title}
摘要：{excerpt}

请用专业、简洁的语言进行总结。"""
            
            response = self.model.generate_content(prompt)
            return response.text if response.text else "无法生成摘要。"
        
        except Exception as e:
            print(f"AI 摘要生成错误: {e}")
            return "智能助手暂时无法连接。"
    
    async def get_recommendation_reason(self, interest: str) -> str:
        """
        生成推荐理由
        
        Args:
            interest: 用户兴趣标签
        
        Returns:
            推荐理由文本
        """
        try:
            prompt = f"""作为资深新闻分析师，告诉我为什么用户会对"{interest}"感兴趣？
从行业趋势出发，回复一小段话（不超过50字）。"""
            
            response = self.model.generate_content(prompt)
            return response.text if response.text else ""
        
        except Exception as e:
            print(f"AI 推荐理由生成错误: {e}")
            return ""


# 创建全局 AI 服务实例
ai_service = AIService()
