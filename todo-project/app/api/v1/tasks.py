# app/api/v1/tasks.py

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.session import get_db
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.schemas.task import (
    TaskCreate,
    TaskListParams,
    TaskListResponse,
    TaskRead,
    TaskUpdate,
)
from app.services.task_service import TaskService


router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_service(db=Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(db))


@router.post("", response_model=TaskRead)
def create_task(
    payload: TaskCreate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    return service.create_task(payload.title, current_user.id)


@router.get("", response_model=TaskListResponse)
def list_tasks(
    params: TaskListParams = Depends(),
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    items, total = service.list_tasks(owner_id=current_user.id, params=params)
    pages = (total + params.page_size - 1) // params.page_size

    return TaskListResponse(
        items=items,
        total=total,
        page=params.page,
        page_size=params.page_size,
        pages=pages,
    )


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    return service.update_task(
        task_id,
        current_user.id,
        payload.title,
        payload.completed,
    )


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    service.delete_task(task_id, current_user.id)
    return {"success": True}
