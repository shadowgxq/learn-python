from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskQueryParams
from app.core.exceptions import TaskNotFoundException
from app.core.session import transaction


class TaskService:
    """任务业务逻辑层，处理任务相关的业务规则。"""

    def __init__(self, repo: TaskRepository, db: Session):
        self.repo = repo
        self.db = db

    def create_task(self, title: str, owner_id: int) -> Task:
        with transaction(self.db):
            task = self.repo.create(title=title, owner_id=owner_id)
        self.db.refresh(task)  # commit 后刷新，拿到数据库生成的 id/时间戳
        return task

    def list_tasks(self, params: TaskQueryParams) -> tuple[list[Task], int]:
        return self.repo.search_by_owner(params)

    def update_task(
        self,
        task_id: int,
        owner_id: int,
        title: str | None,
        completed: bool | None,
    ) -> Task:
        # 查询不属于事务：找不到直接抛，无需回滚（没有未提交的写）
        task = self.repo.get_by_id_and_owner(task_id, owner_id)
        if task is None:
            raise TaskNotFoundException()

        with transaction(self.db):
            task = self.repo.update(task, title=title, completed=completed)
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, owner_id: int) -> None:
        task = self.repo.get_by_id_and_owner(task_id, owner_id)
        if task is None:
            raise TaskNotFoundException()

        with transaction(self.db):
            self.repo.delete(task)

    def list_tasks_with_owner(self, owner_id: int) -> list[Task]:
        return self.repo.get_by_owner_with_user(owner_id)

    def search_tasks_by_owner_username(self, username: str) -> list[Task]:
        return self.repo.search_by_owner_username(username)
