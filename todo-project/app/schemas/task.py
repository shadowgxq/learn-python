# app/schemas/task.py

from typing import Literal
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field, field_serializer

# 接口对外统一返回东八区(UTC+8)时间
CST = timezone(timedelta(hours=8))


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class TaskListParams(BaseModel):
    """任务列表查询参数，统一承载分页、筛选、排序条件。"""

    completed: bool | None = None
    keyword: str | None = Field(default=None, min_length=1, max_length=100)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    sort_by: Literal["id", "title", "completed",
                     "created_at", "updated_at"] = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"


class TaskRead(BaseModel):
    id: int
    title: str
    completed: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }

    @field_serializer("created_at", "updated_at")
    def _to_cst(self, value: datetime) -> str:
        # 数据库存的是 UTC,统一转成东八区再输出(带 +08:00 偏移)
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(CST).isoformat()


class TaskListResponse(BaseModel):
    items: list[TaskRead]
    total: int
    page: int
    page_size: int
    pages: int


class TaskOwnerRead(BaseModel):
    id: int
    username: str

    model_config = {
        "from_attributes": True,
    }


class TaskWithOwnerRead(BaseModel):
    id: int
    title: str
    completed: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime
    owner: TaskOwnerRead

    model_config = {
        "from_attributes": True,
    }

    @field_serializer("created_at", "updated_at")
    def _to_cst(self, value: datetime) -> str:
        # 数据库存的是 UTC,统一转成东八区再输出(带 +08:00 偏移)
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(CST).isoformat()
