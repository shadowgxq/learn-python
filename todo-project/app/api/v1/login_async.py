"""
================================================================================
 Lesson 5：最小异步切片 —— /async/auth/login 全链路 async（对照学习）
================================================================================

这是一条【独立的异步栈】，和现有同步代码并存、互不影响：
  - 同步版登录：app/api/v1/auth.py        -> POST /api/v1/auth/login
  - 异步版登录：本文件                      -> POST /api/v1/async/auth/login

一条 /login 覆盖了异步改造的全部三种情况，逐段对照同步版来看：

  ┌─ DB     同步 db.query(User).filter(...).first()
  │         异步 await db.execute(select(User).where(...))  + AsyncSession + asyncpg
  ├─ Redis  同步 redis_client.incr(key)
  │         异步 await async_redis.incr(key)                + redis.asyncio
  ├─ bcrypt CPU 密集(故意慢)，同步直接调用会冻结事件循环
  │         异步 await run_in_executor(...)                 ← Lesson 4 的解法
  └─ JWT    微秒级 CPU，太快不值得异步 -> 保持同步，直接调用、不 await

核心认知：async 会"传染"。router(async) → service(async) → repo(await db.execute)
          整条链都得是 async，老式 db.query() 在 AsyncSession 上用不了，必须换 select()。
================================================================================
"""

import asyncio

import bcrypt
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
import redis.asyncio as aioredis

from app.core.config import settings
from app.core.exceptions import LoginFailedException, LoginLockedException
from app.core.security import create_access_token  # JWT 保持同步，直接复用
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.response import ApiResponse, success_response


# ============================================================================
# 1. 异步数据库引擎（独立，不动现有同步 engine）
#    同步：create_engine(...)        驱动 psycopg2，URL 形如 postgresql://
#    异步：create_async_engine(...)  驱动 asyncpg， URL 形如 postgresql+asyncpg://
# ============================================================================
def _to_async_url(url: str) -> str:
    """把同步连接串转成 asyncpg 驱动的异步连接串。"""
    for prefix in ("postgresql+psycopg2://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+asyncpg://" + url[len(prefix):]
    return url  # 已经是 asyncpg 或其它，原样返回


async_engine = create_async_engine(_to_async_url(settings.database_url))

# expire_on_commit=False：commit 后对象属性仍可访问，避免异步里触发隐式 IO 懒加载
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)


async def get_async_db():
    """异步依赖：async with 自动管理会话生命周期（对应同步版的 try/finally）。"""
    async with AsyncSessionLocal() as db:
        yield db


# ============================================================================
# 2. 异步 Redis（独立客户端）
#    同步：redis.Redis.from_url(...)        调用直接返回结果
#    异步：redis.asyncio.from_url(...)      每个命令都要 await
# ============================================================================
async_redis = aioredis.from_url(settings.redis_url, decode_responses=True)

LOGIN_FAIL_PREFIX = "login:fail:"
MAX_LOGIN_FAILURES = 5
LOGIN_LOCK_SECONDS = 10 * 60


async def is_login_locked(username: str) -> bool:
    value = await async_redis.get(f"{LOGIN_FAIL_PREFIX}{username}")
    return value is not None and int(value) >= MAX_LOGIN_FAILURES


async def record_login_failure(username: str) -> int:
    key = f"{LOGIN_FAIL_PREFIX}{username}"
    count = await async_redis.incr(key)
    if count == 1:
        await async_redis.expire(key, LOGIN_LOCK_SECONDS)
    return int(count)


async def clear_login_failure(username: str) -> None:
    await async_redis.delete(f"{LOGIN_FAIL_PREFIX}{username}")


# ============================================================================
# 3. bcrypt 校验：CPU 密集（故意设计得慢，几十~上百 ms）
#    直接在 async 里调用 = Lesson 4 的阻塞陷阱，会冻结事件循环。
#    解法：run_in_executor 丢线程池，让出事件循环。
# ============================================================================
async def verify_password_async(password: str, password_hash: str) -> bool:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None,                       # None = 默认线程池
        bcrypt.checkpw,             # 要在线程里跑的同步函数
        password.encode(),          # 它的参数...
        password_hash.encode(),
    )


# ============================================================================
# 4. 异步 repository：db.query() 用不了，换成 select() + await execute()
#    同步：self.db.query(User).filter(User.username == x).first()
#    异步：(await db.execute(select(User).where(...))).scalar_one_or_none()
# ============================================================================
async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


# ============================================================================
# 5. 异步 service：业务编排，对照同步版 AuthService.login 逐行看
# ============================================================================
async def login_service(db: AsyncSession, username: str, password: str) -> str:
    # 1. 已锁定直接拒绝
    if await is_login_locked(username):
        raise LoginLockedException()

    # 2. 校验用户名与密码（DB + bcrypt 都是 await）
    user = await get_user_by_username(db, username)
    if user is None or not await verify_password_async(password, user.password_hash):
        count = await record_login_failure(username)
        if count >= MAX_LOGIN_FAILURES:
            raise LoginLockedException()
        raise LoginFailedException()

    # 3. 成功：清计数 + 签发 token。create_access_token 是同步的，不要 await！
    await clear_login_failure(username)
    return create_access_token(subject=str(user.id))


# ============================================================================
# 6. 异步 router：handler 是 async def，依赖注入异步会话
# ============================================================================
router = APIRouter(prefix="/async/auth", tags=["async-demo"])


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_async_db),
):
    token = await login_service(db, payload.username, payload.password)
    return success_response({"access_token": token, "token_type": "bearer"})
