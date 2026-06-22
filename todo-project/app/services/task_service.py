from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskQueryParams


class TaskService:
    """任务业务逻辑层，处理任务相关的业务规则。"""

    def __init__(self, repo: TaskRepository, db: Session):
        self.repo = repo
        self.db = db

    def create_task(self, title: str, owner_id: int) -> Task:
        try:
            task = self.repo.create(title=title, owner_id=owner_id)

            self.db.commit()
            self.db.refresh(task)

            return task
        except Exception:
            self.db.rollback()
            raise

    def list_tasks(self, params: TaskQueryParams) -> tuple[list[Task], int]:
        return self.repo.search_by_owner(params)

    def update_task(
        self,
        task_id: int,
        owner_id: int,
        title: str | None,
        completed: bool | None,
    ) -> Task:
        try:
            task = self.repo.get_by_id_and_owner(task_id, owner_id)
            if task is None:
                raise HTTPException(status_code=404, detail="Task not found")
            task = self.repo.update(
                task,
                title=title,
                completed=completed,
            )
            self.db.commit()
            self.db.refresh(task)
            return task
        except Exception:
            self.db.rollback()
            raise

    def delete_task(self, task_id: int, owner_id: int) -> None:
        try:
            task = self.repo.get_by_id_and_owner(task_id, owner_id)

            if task is None:
                raise HTTPException(status_code=404, detail="Task not found")

            self.repo.delete(task)

            self.db.commit()

        except Exception:
            self.db.rollback()
            raise

    def list_tasks_with_owner(self, owner_id: int) -> list[Task]:
        return self.repo.get_by_owner_with_user(owner_id)

    def search_tasks_by_owner_username(self, username: str) -> list[Task]:
        return self.repo.search_by_owner_username(username)
