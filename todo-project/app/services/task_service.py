from fastapi import HTTPException

from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskListParams


class TaskService:
    """任务业务逻辑层，处理任务相关的业务规则。"""

    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def create_task(self, title: str, owner_id: int) -> Task:
        return self.repo.create(title, owner_id)

    def list_tasks(self, owner_id: int, params: TaskListParams) -> tuple[list[Task], int]:
        return self.repo.search_by_owner(owner_id=owner_id, params=params)

    def update_task(self, task_id: int, owner_id: int, title: str | None, completed: bool | None) -> Task:
        task = self.repo.get_by_id_and_owner(task_id, owner_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return self.repo.update(task, title=title, completed=completed)

    def delete_task(self, task_id: int, owner_id: int) -> None:
        task = self.repo.get_by_id_and_owner(task_id, owner_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        self.repo.delete(task)

    def list_tasks_with_owner(self, owner_id: int) -> list[Task]:
        return self.repo.get_by_owner_with_user(owner_id)

    def search_tasks_by_owner_username(self, username: str) -> list[Task]:
        return self.repo.search_by_owner_username(username)
