/**
 * API 服务层：封装所有后端 API 调用
 */
import axios, { AxiosInstance } from 'axios';
import type { Article, User } from '../types';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// 请求拦截器：添加 Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token 过期或无效，清除本地存储并跳转登录
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            localStorage.removeItem('user_info');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// ==================== 认证 API ====================

export const authAPI = {
    /**
     * 用户注册
     */
    register: async (email: string, password: string, name: string) => {
        const response = await apiClient.post('/auth/register', { email, password, name });
        return response.data;
    },

    /**
     * 用户登录
     */
    login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        // 保存 Token 和用户信息
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    /**
     * 获取当前用户信息
     */
    getProfile: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * 更新用户资料
     */
    updateProfile: async (data: { name?: string; avatar?: string; interests?: string[] }) => {
        const response = await apiClient.put('/auth/profile', data);
        // 更新本地存储的用户信息
        localStorage.setItem('user_info', JSON.stringify(response.data));
        return response.data;
    },

    /**
     * 退出登录
     */
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('auth_token');
    },

    /**
     * 获取本地存储的用户信息
     */
    getLocalUser: (): User | null => {
        const userStr = localStorage.getItem('user_info');
        return userStr ? JSON.parse(userStr) : null;
    },
};

// ==================== 文章 API ====================

export const articlesAPI = {
    /**
     * 获取文章列表
     */
    getList: async (params: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
    }) => {
        const response = await apiClient.get('/articles', { params });
        return response.data;
    },

    /**
     * 获取文章详情
     */
    getById: async (id: string): Promise<Article> => {
        const response = await apiClient.get(`/articles/${id}`);
        return response.data;
    },

    /**
     * 获取推荐文章
     */
    getRecommended: async (): Promise<Article[]> => {
        const response = await apiClient.get('/articles/recommended');
        return response.data;
    },

    /**
     * 创建文章（管理员）
     */
    create: async (articleData: Partial<Article>) => {
        const response = await apiClient.post('/articles', articleData);
        return response.data;
    },

    /**
     * 更新文章（管理员）
     */
    update: async (id: string, articleData: Partial<Article>) => {
        const response = await apiClient.put(`/articles/${id}`, articleData);
        return response.data;
    },

    /**
     * 删除文章（管理员）
     */
    delete: async (id: string) => {
        const response = await apiClient.delete(`/articles/${id}`);
        return response.data;
    },
};

// ==================== 用户交互 API ====================

export const interactionsAPI = {
    /**
     * 点赞文章
     */
    like: async (articleId: string) => {
        const response = await apiClient.post('/interactions/like', { article_id: articleId });
        return response.data;
    },

    /**
     * 点踩文章
     */
    dislike: async (articleId: string) => {
        const response = await apiClient.post('/interactions/dislike', { article_id: articleId });
        return response.data;
    },

    /**
     * 收藏文章
     */
    bookmark: async (articleId: string) => {
        const response = await apiClient.post('/interactions/bookmark', { article_id: articleId });
        return response.data;
    },

    /**
     * 取消收藏
     */
    removeBookmark: async (articleId: string) => {
        const response = await apiClient.delete(`/interactions/bookmark/${articleId}`);
        return response.data;
    },

    /**
     * 获取收藏列表
     */
    getBookmarks: async (page: number = 1, limit: number = 20) => {
        const response = await apiClient.get('/interactions/bookmarks', { params: { page, limit } });
        return response.data;
    },

    /**
     * 记录阅读历史
     */
    recordReading: async (articleId: string, readDuration: number) => {
        const response = await apiClient.post('/interactions/read', {
            article_id: articleId,
            read_duration: readDuration,
        });
        return response.data;
    },

    /**
     * 获取阅读历史
     */
    getHistory: async (page: number = 1, limit: number = 20) => {
        const response = await apiClient.get('/interactions/history', { params: { page, limit } });
        return response.data;
    },
};

export const subscriptionsAPI = {
    /**
     * 切换订阅状态
     */
    toggle: async (publisherName: string, publisherAvatar?: string, followersCount?: string) => {
        const response = await apiClient.post('/interactions/subscribe', {
            publisher_name: publisherName,
            publisher_avatar: publisherAvatar,
            followers_count: followersCount
        });
        return response.data;
    },

    /**
     * 获取订阅列表
     */
    getList: async () => {
        const response = await apiClient.get('/interactions/subscriptions');
        return response.data;
    },
};

// ==================== AI 功能 API ====================

export const aiAPI = {
    /**
     * 生成文章摘要
     */
    summarize: async (title: string, excerpt: string): Promise<string> => {
        const response = await apiClient.post('/ai/summarize', { title, excerpt });
        return response.data.summary;
    },
};

// ==================== 管理员 API ====================

export const adminAPI = {
    /**
     * 获取用户列表
     */
    getUsers: async (params: { page?: number; limit?: number; search?: string }) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    },

    /**
     * 更新用户状态
     */
    updateUserStatus: async (userId: string, status: 'active' | 'banned') => {
        const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
        return response.data;
    },

    /**
     * 获取统计数据
     */
    getStats: async () => {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    },
};

// 导出 API 客户端实例（用于自定义请求）
export { apiClient };
