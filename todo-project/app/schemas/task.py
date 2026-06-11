# app/schemas/task.py

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class TaskRead(BaseModel):
    id: int
    title: str
    completed: bool

    model_config = {
        "from_attributes": True,
    }