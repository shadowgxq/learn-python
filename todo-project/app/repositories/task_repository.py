from sqlalchemy.orm import Session, joinedload
from app.models.task import Task
from app.models.user import User
from app.schemas.task import SortOrder, TaskQueryParams, TaskSortBy


class TaskRepository:
    """任务数据访问层，封装所有 Task 相关的数据库操作。"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, title: str, owner_id: int) -> Task:
        task = Task(title=title, owner_id=owner_id)
        self.db.add(task)
        self.db.flush()
        return task

    def get_by_id(self, task_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_by_id_and_owner(self, task_id: int, owner_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id, Task.owner_id == owner_id).first()

    def get_by_owner(self, owner_id: int) -> list[Task]:
        return self.db.query(Task).filter(Task.owner_id == owner_id).all()

    def search_by_owner(self, params: TaskQueryParams) -> tuple[list[Task], int]:
        query = self.db.query(Task).filter(Task.owner_id == params.owner_id)

        if params.completed is not None:
            query = query.filter(Task.completed == params.completed)

        if params.keyword:
            query = query.filter(Task.title.ilike(f"%{params.keyword}%"))

        total = query.count()

        sort_columns = {
            TaskSortBy.ID: Task.id,
            TaskSortBy.TITLE: Task.title,
            TaskSortBy.COMPLETED: Task.completed,
            TaskSortBy.CREATED_AT: Task.created_at,
            TaskSortBy.UPDATED_AT: Task.updated_at,
        }

        sort_column = sort_columns.get(params.sort_by, Task.created_at)

        primary_order = sort_column.desc(
        ) if params.sort_order == SortOrder.DESC else sort_column.asc()

        # id 是唯一且单调的，单列排序即可保证稳定；
        # 其它列可能有重复值，追加 id.desc() 作为兜底，保证翻页顺序确定。
        if params.sort_by == TaskSortBy.ID:
            query = query.order_by(primary_order)
        else:
            query = query.order_by(primary_order, Task.id.desc())

        items = query.offset(params.offset).limit(params.page_size).all()

        return items, total

    def update(self, task: Task, title: str | None = None, completed: bool | None = None) -> Task:
        if title is not None:
            task.title = title
        if completed is not None:
            task.completed = completed
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)

    def get_by_owner_with_user(self, owner_id: int) -> list[Task]:
        return (
            self.db.query(Task)
            .options(joinedload(Task.owner))
            .filter(Task.owner_id == owner_id)
            .order_by(Task.created_at.desc(), Task.id.desc())
            .all()
        )

    def search_by_owner_username(self, username: str) -> list[Task]:
        return (
            self.db.query(Task)
            .join(User, Task.owner_id == User.id)
            .options(joinedload(Task.owner))
            .filter(User.username == username)
            .order_by(Task.created_at.desc(), Task.id.desc())
            .all()
        )
