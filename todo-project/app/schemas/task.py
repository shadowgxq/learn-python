# app/schemas/task.py

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_serializer

# 接口对外统一返回东八区(UTC+8)时间
CST = timezone(timedelta(hours=8))


class TaskSortBy(str, Enum):
    """任务列表可排序的字段白名单。

    继承 str 是为了让 FastAPI 能直接把 URL 查询字符串映射成枚举成员，
    同时枚举成员本身也能当字符串用（如和数据库列名对照）。
    """

    ID = "id"
    TITLE = "title"
    COMPLETED = "completed"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"


class SortOrder(str, Enum):
    """排序方向。"""

    ASC = "asc"
    DESC = "desc"


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


@dataclass(frozen=True)
class TaskQueryParams:
    """任务列表的内部查询参数对象。

    API 层把 HTTP 入参 + 当前用户的 owner_id 组装成它，
    Service / Repository 只读取，不再各接一长串散参数。
    frozen=True 保证它创建后不可变，避免下游中途改值。
    """

    owner_id: int
    completed: bool | None = None
    keyword: str | None = None
    page: int = 1
    page_size: int = 10
    sort_by: TaskSortBy = TaskSortBy.CREATED_AT
    sort_order: SortOrder = SortOrder.DESC

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class TaskListParams(BaseModel):
    """任务列表 HTTP 查询参数，负责对外入参的校验与 OpenAPI 文档。"""

    completed: bool | None = None
    keyword: str | None = Field(default=None, min_length=1, max_length=100)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    sort_by: TaskSortBy = TaskSortBy.CREATED_AT
    sort_order: SortOrder = SortOrder.DESC

    def to_query(self, owner_id: int) -> TaskQueryParams:
        """结合当前用户的 owner_id 组装成内部查询对象。"""
        return TaskQueryParams(
            owner_id=owner_id,
            completed=self.completed,
            keyword=self.keyword,
            page=self.page,
            page_size=self.page_size,
            sort_by=self.sort_by,
            sort_order=self.sort_order,
        )


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
