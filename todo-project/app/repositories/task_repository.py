from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskListParams


class TaskRepository:
    """任务数据访问层，封装所有 Task 相关的数据库操作。"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, title: str, owner_id: int) -> Task:
        task = Task(title=title, owner_id=owner_id)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_by_id(self, task_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_by_id_and_owner(self, task_id: int, owner_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id, Task.owner_id == owner_id).first()

    def get_by_owner(self, owner_id: int) -> list[Task]:
        return self.db.query(Task).filter(Task.owner_id == owner_id).all()

    def search_by_owner(self, owner_id: int, params: TaskListParams) -> tuple[list[Task], int]:
        query = self.db.query(Task).filter(Task.owner_id == owner_id)

        if params.completed is not None:
            query = query.filter(Task.completed == params.completed)

        if params.keyword:
            query = query.filter(Task.title.ilike(f"%{params.keyword}%"))

        total = query.count()

        sort_columns = {
            "id": Task.id,
            "title": Task.title,
            "completed": Task.completed,
            "created_at": Task.created_at,
            "updated_at": Task.updated_at,
        }

        sort_column = sort_columns[params.sort_by]

        primary_order = sort_column.desc() if params.sort_order == "desc" else sort_column.asc()

        if params.sort_by == "created_at":
            query = query.order_by(primary_order)
        else:
            query = query.order_by(primary_order, Task.id.desc())

        offset = (params.page - 1) * params.page_size
        items = query.offset(offset).limit(params.page_size).all()

        return items, total

    def update(self, task: Task, title: str | None = None, completed: bool | None = None) -> Task:
        if title is not None:
            task.title = title
        if completed is not None:
            task.completed = completed
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()
