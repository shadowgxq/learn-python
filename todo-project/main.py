from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.auth import router as auth_router
from app.api.v1.tasks import router as tasks_router
from app.core.exception_handlers import (
    business_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.exceptions import BusinessException

app = FastAPI(title="Demo API")

# 注册统一异常处理器
app.add_exception_handler(BusinessException, business_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}
