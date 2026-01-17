import bcrypt

hash_str = b"$2b$12$9.Jztav5q8gOnMIYz7jPU./O1U2/4zcPTLMPGY2FfiE8NBonUUoFK"
password = b"password123"

try:
    match = bcrypt.checkpw(password, hash_str)
    print(f"Match for 'password123': {match}")
except Exception as e:
    print(f"Error: {e}")
