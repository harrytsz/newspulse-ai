import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client

# 加载环境变量
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

async def test_admin_access():
    print(f"Testing connection to: {SUPABASE_URL}")
    print(f"Using Service Key: {SUPABASE_SERVICE_KEY[:10]}...{SUPABASE_SERVICE_KEY[-10:]}")
    
    # 创建使用 Service Key 的客户端
    try:
        admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("Client created successfully.")
        
        # 尝试查询订阅表（应该绕过 RLS）
        print("Attempting to fetch subscriptions...")
        response = admin_client.table("subscriptions").select("*", count="exact").limit(1).execute()
        print(f"Fetch success! Count: {response.count}")
        print(f"Data: {response.data}")
        
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_admin_access())
