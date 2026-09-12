from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.models.project_model import Project
from app.schemas.project_schema import (
  ProjectAdminResponse,
  ProjectCreate,
  ProjectUpdate,
)
from app.core.database import SessionDep

router = APIRouter()


@router.get(
  "",
  response_model=List[ProjectAdminResponse],
  status_code=status.HTTP_200_OK,
  summary="[Admin] Список всех проектов с метриками",
  description="""
    Возвращает полный список всех проектов для панели администратора.

    * **Включает:** скрытые проекты (`is_published = False`), черновики и опубликованные работы.
    * **Метрики:** отдаёт счетчики просмотров (`views_count`) и кликов по внешним ссылкам (`github_clicks`, `demo_clicks`).
    * **Сортировка:** сначала по полю порядка (`order` asc), затем по дате создания (`created_at` desc).
    """,
  responses={
    200: {
      "description": "Успешное получение списка проектов.",
    }
  },
)
async def get_all_projects_admin(session: SessionDep):
  query = select(Project).order_by(Project.order.asc(), Project.created_at.desc())
  result = await session.execute(query)
  return result.scalars().all()


@router.post(
  "",
  response_model=ProjectAdminResponse,
  status_code=status.HTTP_201_CREATED,
  summary="[Admin] Создание нового проекта",
  description="""
    Создаёт новый проект портфолио.

    * **Уникальность:** `slug` должен быть уникальным в пределах системы.
    * **Формат `slug`:** только строчные латинские буквы, цифры и дефисы (например, `college-flow`).
    """,
  responses={
    201: {
      "description": "Проект успешно создан.",
    },
    400: {
      "description": "Проект с указанным `slug` уже существует.",
      "content": {
        "application/json": {
          "example": {"detail": "Проект с таким slug уже существует"}
        }
      },
    },
    422: {
      "description": "Ошибка валидации входных данных (например, неверный формат `slug` или превышена длина `summary`).",
    },
  },
)
async def create_project(data: ProjectCreate, session: SessionDep):
  existing = await session.execute(
    select(Project).where(Project.slug == data.slug)
  )
  if existing.scalar_one_or_none():
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Проект с таким slug уже существует",
    )

  project = Project(**data.model_dump())
  session.add(project)
  await session.commit()
  await session.refresh(project)
  return project


@router.patch(
  "/{project_id}",
  response_model=ProjectAdminResponse,
  status_code=status.HTTP_200_OK,
  summary="[Admin] Частичное обновление проекта",
  description="""
    Обновляет указанные поля проекта по его `UUID`.

    * При переданном новом `slug` выполняется проверка на его занятость другими проектами.
    * Поля, не переданные в body, остаются без изменений (`exclude_unset=True`).
    """,
  responses={
    200: {
      "description": "Данные проекта успешно обновлены.",
    },
    400: {
      "description": "Указанный `slug` уже занят другим проектом.",
      "content": {
        "application/json": {
          "example": {"detail": "Этот slug уже занят"}
        }
      },
    },
    404: {
      "description": "Проект с таким `UUID` не найден.",
      "content": {
        "application/json": {
          "example": {"detail": "Проект не найден"}
        }
      },
    },
  },
)
async def update_project(
  project_id: UUID, data: ProjectUpdate, session: SessionDep
):
  project = await session.get(Project, project_id)
  if not project:
    raise HTTPException(status_code=404, detail="Проект не найден")

  update_data = data.model_dump(exclude_unset=True)

  if "slug" in update_data and update_data["slug"] != project.slug:
    existing = await session.execute(
      select(Project).where(Project.slug == update_data["slug"])
    )
    if existing.scalar_one_or_none():
      raise HTTPException(status_code=400, detail="Этот slug уже занят")

  for key, value in update_data.items():
    setattr(project, key, value)

  await session.commit()
  await session.refresh(project)
  return project


@router.delete(
  "/{project_id}",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="[Admin] Удаление проекта",
  description="Безвозвратно удаляет проект из базы данных по его `UUID`.",
  responses={
    204: {
      "description": "Проект успешно удалён.",
    },
    404: {
      "description": "Проект с таким `UUID` не найден.",
      "content": {
        "application/json": {
          "example": {"detail": "Проект не найден"}
        }
      },
    },
  },
)
async def delete_project(project_id: UUID, session: SessionDep):
  project = await session.get(Project, project_id)
  if not project:
    raise HTTPException(status_code=404, detail="Проект не найден")

  await session.delete(project)
  await session.commit()