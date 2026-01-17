"""
Supabase 数据库连接管理
"""
from supabase import create_client, Client, ClientOptions
from app.config import settings


class Database:
    """数据库连接单例类"""
    
    _instance: Client = None
    _admin_instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """获取 Supabase 客户端实例 (Anon Key)"""
        if cls._instance is None:
            # 检查是否有代理配置
            import os
            proxy = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
            client_options = ClientOptions()
            if proxy:
                # supabase-py 的 ClientOptions 不直接支持 proxy 参数，但可以通过 replace_file_content 修改底层 httpx transport
                # 不过更简单的方法是不传 options['proxy']，而是依赖 httpx 对环境变量的自动识别
                # 但既然用户显式遇到了连接问题，可能是 httpx 版本过老或环境问题
                # 如果 supabase < 2.0，可能不同。这里是 supabase==2.4.0
                # ClientOptions 定义通常在 supabase.lib.client_options
                pass
            
            # 实际上，如果 supabase 库基于 httpx，且 httpx 版本正确，它应该自动读取环境变量。
            # 但之前的错误表明字典传进去被当成了对象用。
            # 我们先尝试不传 options，看看是否可以通过环境变量自动生效。
            # 如果之前的错误是因为我传了 dict，那我不传 options 应该能回到 ConnectTimeout (如果没有代理) 或 成功 (如果有代理且自动识别)。
            
            # 等等，之前的 ConnectTimeout 是因为没走代理。
            # 设置了环境变量后，如果我不传 options，httpx 应该会自动读取。
            # 之前的错误是因为我传了 `options={'proxy': ...}` (dict)，而代码以此访问 `.headers`。
            
            # 正确的做法是：
            # 1. 如果 supabase-py >= 2.0，create_client(url, key, options=ClientOptions(...))
            # 2. 目前 supabase-py 的 ClientOptions 可能没有 proxy 参数。
            
            # 让我们先修正 AttributeError。
            # 既然 httpx 会自动读取环境变量，我其实可以删掉显式的 options 传递，
            # 只要用户在终端设置了环境变量，httpx (supabase 的底层) 就应该能用。
            # 之前的 ConnectTimeout 可能是因为用户之前没设环境变量。
            # 用户后来被我告知去设环境变量了。
            
            # 所以，我这里将其改回不传 options，或者传正确的 ClientOptions。
            # 为了稳妥，我先尝试不传 options，因为 HTTPX 默认支持环境变量代理。
            
            cls._instance = create_client(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_key
            )
        return cls._instance
    
    @classmethod
    def get_admin_client(cls) -> Client:
        """获取 Supabase 管理员客户端（使用 service key, 单例）"""
        if cls._admin_instance is None:
            cls._admin_instance = create_client(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_service_key
            )
        return cls._admin_instance


def get_db() -> Client:
    """依赖注入：获取数据库客户端 (Anon Key)"""
    return Database.get_client()

def get_admin_db() -> Client:
    """依赖注入：获取管理员数据库客户端 (Service Key)"""
    return Database.get_admin_client()
