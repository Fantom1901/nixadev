from fastapi import APIRouter, HTTPException, status, Response
from sqlalchemy import select

from app.core.database import SessionDep  # твой импорт зависимости
from app.models.user import User
from app.schemas.auth_schema import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    db: SessionDep,
):
    # 1. Ищем пользователя через async select
    stmt = select(User).where(User.username == data.username)
    user = await db.scalar(stmt)

    # 2. Проверяем существование и пароль
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )

    # 3. Генерируем JWT
    access_token = create_access_token(data={"sub": user.id, "username": user.username})

    # 4. Проставляем Cookie для Next.js Middleware
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Поставь True на проде с HTTPS
        max_age=60 * 60 * 24 * 7,
    )

    return TokenResponse(access_token=access_token)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("auth_token")
    return {"message": "Успешный выход"}