# app/core/exceptions.py


class BusinessException(Exception):
    """业务异常基类。"""

    def __init__(
        self,
        code: int,
        message: str,
        status_code: int = 400,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class TaskNotFoundException(BusinessException):
    """任务不存在。"""

    def __init__(self):
        super().__init__(
            code=40401,
            message="Task not found",
            status_code=404,
        )


class PermissionDeniedException(BusinessException):
    """无权限操作。"""

    def __init__(self):
        super().__init__(
            code=40301,
            message="Permission denied",
            status_code=403,
        )


class UsernameAlreadyExistsException(BusinessException):
    """用户名已存在。"""

    def __init__(self):
        super().__init__(
            code=40001,
            message="Username already exists",
            status_code=400,
        )


class LoginFailedException(BusinessException):
    """登录失败（用户名或密码错误）。"""

    def __init__(self):
        super().__init__(
            code=40101,
            message="Invalid username or password",
            status_code=401,
        )
