from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.database import SessionDep
from app.models.project import Project
from app.schemas.project import (
    ProjectAdminResponse,
    ProjectCreate,
    ProjectUpdate,
)

router = APIRouter()


@router.get("", response_model=List[ProjectAdminResponse])
async def get_all_projects_admin(session: SessionDep):
    """Список вообще всех проектов (включая черновики) с метриками."""
    query = select(Project).order_by(Project.order.asc(), Project.created_at.desc())
    result = await session.execute(query)
    return result.scalars().all()


@router.post("", response_model=ProjectAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate, session: SessionDep):
    """Создание нового проекта."""
    existing = await session.execute(select(Project).where(Project.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Проект с таким slug уже существует"
        )

    project = Project(**data.model_dump())
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectAdminResponse)
async def update_project(project_id: UUID, data: ProjectUpdate, session: SessionDep):
    """Обновление проекта."""
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


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: UUID, session: SessionDep):
    """Удаление проекта."""
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    await session.delete(project)
    await session.commit()