from fastapi import HTTPException

from app.models.task import Task
from app.repositories.task_repository import TaskRepository


class TaskService:
    """任务业务逻辑层，处理任务相关的业务规则。"""

    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def create_task(self, title: str) -> Task:
        return self.repo.create(title)

    def list_tasks(self) -> list[Task]:
        return self.repo.get_all()

    def update_task(self, task_id: int, title: str | None, completed: bool | None) -> Task:
        task = self.repo.get_by_id(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return self.repo.update(task, title=title, completed=completed)

    def delete_task(self, task_id: int) -> None:
        task = self.repo.get_by_id(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        self.repo.delete(task)
