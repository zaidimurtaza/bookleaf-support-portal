"""Authentication logic"""
import os
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from app.db import query

JWT_SECRET = os.getenv("JWT_SECRET", "secret")
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password = password[:72]  # Bcrypt limit
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash"""
    password = password[:72]  # Bcrypt limit
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def login(email: str, password: str):
    user = query("SELECT * FROM bookleaf.users WHERE email = %s", (email,), one=True)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    
    token = jwt.encode({
        "sub": user["user_id"],
        "role": user["role"],
        "id": user["id"],
        "exp": datetime.utcnow() + timedelta(days=1)
    }, JWT_SECRET)
    
    return {"access_token": token, "user": {"name": user["name"], "role": user["role"]}}

def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(401, "Invalid token")

def require_admin(user = Depends(verify_token)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin required")
    return user
