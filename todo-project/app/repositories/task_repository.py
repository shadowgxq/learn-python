from sqlalchemy.orm import Session

from app.models.task import Task


class TaskRepository:
    """任务数据访问层，封装所有 Task 相关的数据库操作。"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, title: str) -> Task:
        task = Task(title=title)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_by_id(self, task_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_all(self) -> list[Task]:
        return self.db.query(Task).all()

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
