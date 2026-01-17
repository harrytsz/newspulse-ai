
import { GoogleGenAI } from "@google/genai";

export class NewsAIService {
  private ai: GoogleGenAI;

  constructor() {
    // Always use process.env.API_KEY directly as a named parameter
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async summarizeArticle(title: string, excerpt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `请总结以下新闻文章的深度价值，用两三句话概括：\n标题：${title}\n摘要：${excerpt}`,
        config: {
          temperature: 0.7,
        },
      });
      // Correctly access .text property (it is not a method)
      return response.text || "无法生成摘要。";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "智能助手暂时无法连接。";
    }
  }

  async getRecommendationReason(interest: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `作为资深新闻分析师，告诉我为什么用户会对"${interest}"感兴趣？从行业趋势出发，回复一小段话。`,
      });
      // Correctly access .text property
      return response.text || "";
    } catch (error) {
      return "";
    }
  }
}

export const aiService = new NewsAIService();
