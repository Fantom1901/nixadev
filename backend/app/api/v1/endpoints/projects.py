from typing import List, Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, update

from app.core.database import SessionDep
from app.models.project_model import Project
from app.schemas.project_schema import ProjectPublicResponse

router = APIRouter()


@router.get(
  "",
  response_model=List[ProjectPublicResponse],
  status_code=status.HTTP_200_OK,
  summary="Публичный каталог проектов",
  description="""
    Возвращает список всех опубликованных проектов для витрины портфолио (`is_published = True`).

    * **Приватность:** В отличие от админ-эндпоинта, не раскрывает счетчики просмотров и кликов (`views_count`, `github_clicks`, `demo_clicks`).
    * **Сортировка:**
      1. Избранные проекты (`is_featured = True`) идут первыми.
      2. Ручной порядок (`order` asc).
      3. Дата создания (`created_at` desc).
    """,
  responses={
    200: {
      "description": "Успешное получение списка опубликованных проектов.",
    }
  },
)
async def get_published_projects(session: SessionDep):
  query = (
    select(Project)
    .where(Project.is_published.is_(True))
    .order_by(
      Project.is_featured.desc(),
      Project.order.asc(),
      Project.created_at.desc(),
    )
  )
  result = await session.execute(query)
  return result.scalars().all()


@router.get(
  "/{slug}",
  response_model=ProjectPublicResponse,
  status_code=status.HTTP_200_OK,
  summary="Получить детальную информацию о проекте",
  description="""
    Возвращает публичные данные конкретного проекта по его уникальному человекопонятному URL (`slug`).

    * Запрос успешна только для опубликованных проектов (`is_published = True`).
    * Полное описание отдаётся в формате **Markdown**.
    """,
  responses={
    200: {
      "description": "Проект успешно найден.",
    },
    404: {
      "description": "Проект с таким `slug` не найден или находится в черновиках.",
      "content": {
        "application/json": {
          "example": {"detail": "Проект не найден"}
        }
      },
    },
  },
)
async def get_project_by_slug(slug: str, session: SessionDep):
  query = select(Project).where(
    Project.slug == slug, Project.is_published.is_(True)
  )
  result = await session.execute(query)
  project = result.scalar_one_or_none()

  if not project:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден"
    )
  return project


@router.post(
  "/{project_id}/track",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="Фиксация метрики/клика по проекту",
  description="""
    Инкрементирует счётчик активности проекта в БД. Вызывается асинхронно с фронтенда.

    * **Типы событий (`event`):**
      * `view` — просмотр карточки / детальной страницы проекта (`views_count + 1`).
      * `github` — клик по ссылке на репозиторий GitHub (`github_clicks + 1`).
      * `demo` — переход на живой демо-сайт (`demo_clicks + 1`).
    * **Оптимизация:** Выполняет прямой `UPDATE` в БDirect без загрузки сущности в память.
    """,
  responses={
    204: {
      "description": "Счётчик метрики успешно инкрементирован.",
    },
    404: {
      "description": "Проект с таким `UUID` не найден или не опубликован.",
      "content": {
        "application/json": {
          "example": {"detail": "Проект не найден"}
        }
      },
    },
    422: {
      "description": "Передан недопустимый тип события `event` (разрешены только: `view`, `github`, `demo`).",
    },
  },
)
async def track_project_metric(
  project_id: UUID,
  event: Literal["view", "github", "demo"] = Query(
    ..., description="Тип фиксируемого события"
  ),
  session: SessionDep = None,
):
  column_map = {
    "view": Project.views_count,
    "github": Project.github_clicks,
    "demo": Project.demo_clicks,
  }

  target_column = column_map[event]

  stmt = (
    update(Project)
    .where(Project.id == project_id, Project.is_published.is_(True))
    .values({target_column: target_column + 1})
  )

  result = await session.execute(stmt)
  if result.rowcount == 0:
    raise HTTPException(status_code=404, detail="Проект не найден")

  await session.commit()