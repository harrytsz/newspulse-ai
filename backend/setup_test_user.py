import asyncio
import os
import sys

# Ensure we can import from app
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
from app.utils.security import get_password_hash

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

TEST_EMAIL = "alex.r@newspulse.com"
TEST_PASSWORD = "password123"
TEST_NAME = "Alex Rivera"

async def setup_test_user():
    print(f"Setting up test user: {TEST_EMAIL}")
    
    if not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_SERVICE_KEY not found in environment.")
        return

    # 1. Connect to DB
    try:
        # httpx (Supabase底层) 会自动读取 HTTP_PROXY/HTTPS_PROXY 环境变量
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        return

    # 2. Hash password
    hashed_password = get_password_hash(TEST_PASSWORD)
    
    # 3. Check if user exists
    try:
        res = supabase.table("users").select("*").eq("email", TEST_EMAIL).execute()
        user = res.data[0] if res.data else None
    except Exception as e:
        print(f"Error checking user: {e}")
        return

    if user:
        print(f"User exists (ID: {user['id']}). Resetting password...")
        # Update password
        supabase.table("users").update({
            "password_hash": hashed_password,
            "status": "active" # Ensure active
        }).eq("id", user['id']).execute()
        print("Password reset to: password123")
    else:
        print("User does not exist. Creating new user...")
        # Create user
        new_user = {
            "email": TEST_EMAIL,
            "password_hash": hashed_password,
            "name": TEST_NAME,
            "role": "user",
            "status": "active",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            "interests": ["Technology", "AI", "Startup"]
        }
        res = supabase.table("users").insert(new_user).execute()
        print("User created successfully.")
        print("Email: alex.r@newspulse.com")
        print("Password: password123")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(setup_test_user())
