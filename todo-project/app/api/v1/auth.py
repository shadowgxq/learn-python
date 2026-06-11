from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db=Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register")
def register(
    payload: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
):
    user = service.register(payload.username, payload.password)
    return {"id": user.id, "username": user.username}


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    access_token = service.login(payload.username, payload.password)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
