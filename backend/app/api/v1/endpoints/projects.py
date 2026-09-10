from typing import List, Literal
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.database import SessionDep
from app.models.project import Project
from app.schemas.project import ProjectPublicResponse

router = APIRouter()


@router.get("", response_model=List[ProjectPublicResponse])
async def get_published_projects(session: SessionDep):
    """Список всех опубликованных проектов."""
    query = (
        select(Project)
        .where(Project.is_published.is_(True))
        .order_by(Project.is_featured.desc(), Project.order.asc(), Project.created_at.desc())
    )
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=ProjectPublicResponse)
async def get_project_by_slug(slug: str, session: SessionDep):
    """Детальная страница проекта по slug."""
    query = select(Project).where(Project.slug == slug, Project.is_published.is_(True))
    result = await session.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проект не найден"
        )
    return project


@router.post("/{project_id}/track", status_code=status.HTTP_204_NO_CONTENT)
async def track_project_metric(
        project_id: UUID,
        event: Literal["view", "github", "demo"],
        session: SessionDep,
):
    """Фиксация телеметрии (просмотр, клик по GitHub / Demo)."""
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