from app.core.redis_client import redis_client


# ==================== 登录失败限制 ====================

LOGIN_FAIL_PREFIX = "login:fail:"
MAX_LOGIN_FAILURES = 5
LOGIN_LOCK_SECONDS = 10 * 60  # 10 分钟


def get_login_fail_key(username: str) -> str:
    """生成登录失败计数的 key。"""
    return f"{LOGIN_FAIL_PREFIX}{username}"


def get_login_fail_count(username: str) -> int:
    """读取当前登录失败次数，无记录返回 0。"""
    value = redis_client.get(get_login_fail_key(username))
    if value is None:
        return 0
    return int(value)


def is_login_locked(username: str) -> bool:
    """是否已达到失败上限被锁定。"""
    return get_login_fail_count(username) >= MAX_LOGIN_FAILURES


def record_login_failure(username: str) -> int:
    """记录一次登录失败，返回当前累计失败次数。

    首次失败时设置过期时间，10 分钟后计数自动清零。
    """
    key = get_login_fail_key(username)
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, LOGIN_LOCK_SECONDS)
    return int(count)


def clear_login_failure(username: str) -> None:
    """清除登录失败计数（登录成功时调用）。"""
    redis_client.delete(get_login_fail_key(username))


# ==================== Token 黑名单 ====================

TOKEN_BLACKLIST_PREFIX = "jwt:blacklist:"


def get_token_blacklist_key(jti: str) -> str:
    """生成 token 黑名单的 key。"""
    return f"{TOKEN_BLACKLIST_PREFIX}{jti}"


def blacklist_token(jti: str, ttl_seconds: int) -> None:
    """把 token 的 jti 加入黑名单，过期时间设为 token 的剩余有效期。"""
    if ttl_seconds <= 0:
        return
    redis_client.set(get_token_blacklist_key(jti), "1", ex=ttl_seconds)


def is_token_blacklisted(jti: str) -> bool:
    """判断 token 是否已被加入黑名单。"""
    return redis_client.exists(get_token_blacklist_key(jti)) == 1
