import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.core.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.cache_service import get_user_cache, set_user_cache

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except JWTError:
        raise credentials_exception

    # 1. 先查 Redis 缓存（缓存失败时降级到数据库）
    try:
        cached_user = get_user_cache(user_id)
        if cached_user:
            return User(
                id=cached_user["id"],
                username=cached_user["username"],
                password_hash="",
            )
    except Exception as e:
        logger.warning(f"Redis 缓存读取失败，降级查数据库: {e}")

    # 2. 缓存未命中或 Redis 不可用，查数据库
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if user is None:
        raise credentials_exception

    # 3. 写入缓存（失败不影响主流程）
    try:
        set_user_cache(
            user_id=user.id,
            user_data={"id": user.id, "username": user.username},
        )
    except Exception as e:
        logger.warning(f"Redis 缓存写入失败: {e}")

    return user
