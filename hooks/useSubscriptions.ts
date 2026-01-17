import { useState, useEffect, useCallback } from 'react';
import { subscriptionsAPI } from '../services/api';

export interface Subscription {
    id: string;
    publisher_name: string;
    publisher_avatar?: string;
    followers_count?: string;
    subscribed_at: string;
}

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        if (!localStorage.getItem('auth_token')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await subscriptionsAPI.getList();
            setSubscriptions(data);
        } catch (e) {
            console.error('获取订阅列表失败:', e);
            // 如果获取失败，可能是因为未登录或后端问题，我们可以选择返回空列表或保持错误
            setError(e instanceof Error ? e.message : '获取订阅列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleSubscription = async (publisher: { name: string; avatar?: string; followers?: string }) => {
        try {
            const result = await subscriptionsAPI.toggle(publisher.name, publisher.avatar, publisher.followers);

            // 更新本地状态
            if (result.message === '已取消订阅') {
                setSubscriptions(prev => prev.filter(s => s.publisher_name !== publisher.name));
            } else {
                // 重新获取列表以获得完整的订阅信息（包括 ID）
                fetchSubscriptions();
            }
            return result.message;
        } catch (e) {
            console.error('切换订阅状态失败:', e);
            throw e;
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    return { subscriptions, loading, error, refetch: fetchSubscriptions, toggleSubscription };
}
