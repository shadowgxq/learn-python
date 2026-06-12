import json

from app.core.redis_client import redis_client


def get_json(key: str) -> dict | None:
    value = redis_client.get(key)

    if value is None:
        return None

    return json.loads(value)


def set_json(key: str, value: dict, expire_seconds: int = 300) -> None:
    redis_client.set(
        key,
        json.dumps(value, ensure_ascii=False),
        ex=expire_seconds,
    )


def delete_key(key: str) -> None:
    redis_client.delete(key)


# ==================== 用户缓存 ====================

USER_CACHE_PREFIX = "user:"
USER_CACHE_EXPIRE_SECONDS = 300  # 5 分钟


def get_user_cache_key(user_id: int) -> str:
    """生成用户缓存的 key。"""
    return f"{USER_CACHE_PREFIX}{user_id}"


def get_user_cache(user_id: int) -> dict | None:
    """从缓存获取用户信息。"""
    return get_json(get_user_cache_key(user_id))


def set_user_cache(user_id: int, user_data: dict) -> None:
    """写入用户缓存。"""
    set_json(
        key=get_user_cache_key(user_id),
        value=user_data,
        expire_seconds=USER_CACHE_EXPIRE_SECONDS,
    )


def delete_user_cache(user_id: int) -> None:
    """删除用户缓存（用户信息变更时调用）。"""
    delete_key(get_user_cache_key(user_id))
