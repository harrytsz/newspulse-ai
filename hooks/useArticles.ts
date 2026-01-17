/**
 * 文章数据管理 Hook
 * 从 Supabase 后端获取文章数据
 */
import { useState, useEffect, useCallback } from 'react';
import type { Article } from '../types';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * 获取文章列表的 Hook
 */
export function useArticles(category?: string) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (category && category !== '发现') {
                params.append('category', category);
            }
            params.append('limit', '50');

            const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);

            if (!response.ok) {
                throw new Error('获取文章失败');
            }

            const data = await response.json();

            // 转换后端数据格式为前端格式
            const formattedArticles: Article[] = (data.articles || []).map((article: any) => ({
                id: article.id,
                title: article.title,
                excerpt: article.excerpt,
                author: article.author,
                source: article.source || article.author,
                date: article.published_date || new Date(article.created_at).toLocaleDateString('zh-CN'),
                category: article.category,
                readTime: article.read_time || '5 分钟',
                readCount: article.read_count || 0,
                commentCount: article.comment_count || 0,
                imageUrl: article.image_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
                images: article.images || [],
                matchScore: article.match_score || 90,
            }));

            setArticles(formattedArticles);
        } catch (e) {
            console.error('获取文章错误:', e);
            setError(e instanceof Error ? e.message : '未知错误');
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return { articles, loading, error, refetch: fetchArticles };
}

/**
 * 获取所有分类的文章（按分类分组）
 */
export function useArticlesByCategory() {
    const [articlesByCategory, setArticlesByCategory] = useState<Record<string, Article[]>>({});
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllArticles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/articles?limit=100`);

            if (!response.ok) {
                throw new Error('获取文章失败');
            }

            const data = await response.json();

            // 转换后端数据格式为前端格式
            const formattedArticles: Article[] = (data.articles || []).map((article: any) => ({
                id: article.id,
                title: article.title,
                excerpt: article.excerpt,
                author: article.author,
                source: article.source || article.author,
                date: article.published_date || new Date(article.created_at).toLocaleDateString('zh-CN'),
                category: article.category,
                readTime: article.read_time || '5 分钟',
                readCount: article.read_count || 0,
                commentCount: article.comment_count || 0,
                imageUrl: article.image_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
                images: article.images || [],
                matchScore: article.match_score || 90,
            }));

            setAllArticles(formattedArticles);

            // 按分类分组
            const grouped: Record<string, Article[]> = {};
            formattedArticles.forEach(article => {
                if (!grouped[article.category]) {
                    grouped[article.category] = [];
                }
                grouped[article.category].push(article);
            });

            setArticlesByCategory(grouped);
        } catch (e) {
            console.error('获取文章错误:', e);
            setError(e instanceof Error ? e.message : '未知错误');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllArticles();
    }, [fetchAllArticles]);

    return { articlesByCategory, allArticles, loading, error, refetch: fetchAllArticles };
}
