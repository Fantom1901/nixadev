import asyncio
import getpass
import os
import sys
from pathlib import Path

# Гарантируем корректный PYTHONPATH
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash


async def create_admin():
    print("=== Создание суперадминистратора ===")

    # 1. Запрашиваем логин (или берём из ENV, если задан)
    username = os.getenv("ADMIN_USERNAME")
    if not username:
        username = input("Введите логин админа: ").strip()

    if not username:
        print("❌ Ошибка: Логин не может быть пустым.")
        return

    # 2. Интерактивный ввод пароля без отображения символов
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = getpass.getpass("Введите пароль: ").strip()
        confirm_password = getpass.getpass("Повторите пароль: ").strip()

        if password != confirm_password:
            print("❌ Ошибка: Пароли не совпадают.")
            return

    if len(password) < 6:
        print("❌ Ошибка: Пароль должен быть не короче 6 символов.")
        return

    # 3. Сохраняем в БД
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.username == username)
        existing_user = await session.scalar(stmt)

        if existing_user:
            print(f"⚠️ Пользователь с логином '{username}' уже существует!")
            return

        admin_user = User(
            username=username,
            hashed_password=get_password_hash(password),
        )
        session.add(admin_user)
        await session.commit()

        print(f"✅ Суперадмин '{username}' успешно создан!")


if __name__ == "__main__":
    asyncio.run(create_admin())