import asyncio
import os
import sys
import bcrypt

# Ensure we can import from app
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

ADMIN_EMAIL = "admin@newspulse.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "System Admin"

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def setup_admin():
    print(f"Setting up admin user: {ADMIN_EMAIL}")
    
    if not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_SERVICE_KEY not found in environment.")
        return

    # 1. Connect to DB
    try:
        # httpx triggers auto proxy from env vars
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        return

    # 2. Hash password
    hashed_password = get_password_hash(ADMIN_PASSWORD)
    
    # 3. Check if user exists
    try:
        res = supabase.table("users").select("*").eq("email", ADMIN_EMAIL).execute()
        user = res.data[0] if res.data else None
    except Exception as e:
        print(f"Error checking user: {e}")
        return

    if user:
        print(f"Admin exists (ID: {user['id']}). Resetting password...")
        # Update password
        supabase.table("users").update({
            "password_hash": hashed_password,
            "role": "admin", # Ensure admin role
            "status": "active"
        }).eq("id", user['id']).execute()
        print("Admin password reset to: admin123")
    else:
        print("Admin does not exist. Creating new admin...")
        # Create user
        new_user = {
            "email": ADMIN_EMAIL,
            "password_hash": hashed_password,
            "name": ADMIN_NAME,
            "role": "admin",
            "status": "active",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
            "interests": ["Technology", "Management"]
        }
        res = supabase.table("users").insert(new_user).execute()
        print("Admin created successfully.")
        print(f"Email: {ADMIN_EMAIL}")
        print(f"Password: {ADMIN_PASSWORD}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(setup_admin())
