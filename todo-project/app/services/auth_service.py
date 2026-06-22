from fastapi import HTTPException

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    """认证业务逻辑层，处理用户注册、登录等认证相关业务。"""

    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, username: str, password: str) -> User:
        existing = self.repo.get_by_username(username)
        if existing:
            raise HTTPException(
                status_code=400, detail="Username already exists")
        return self.repo.create(username=username, password_hash=hash_password(password))

    def login(self, username: str, password: str) -> str:
        user = self.repo.get_by_username(username)
        if user is None or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=401, detail="Invalid username or password")
        return create_access_token(subject=str(user.id))

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.repo.get_by_id(user_id)
