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