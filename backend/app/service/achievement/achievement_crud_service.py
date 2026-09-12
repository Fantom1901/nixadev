import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.achievement.achievement_create_schema import AchievementCreate
from app.models.achievement_model import Achievement
from app.schemas.achievement.achievement_update_schema import AchievementUpdate


class AchievementCRUDService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, dto: AchievementCreate) -> Achievement:
        stmt = select(Achievement).where(Achievement.slug == dto.slug)
        existing = await self.db.execute(stmt)
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Achievement with slug '{dto.slug}' already exists",
            )

        achievement = Achievement(**dto.model_dump())
        self.db.add(achievement)
        await self.db.commit()
        await self.db.refresh(achievement)
        return achievement

    async def update(
        self,
        achievement_id: uuid.UUID,
        dto: AchievementUpdate,
    ) -> Achievement:
        stmt = select(Achievement).where(Achievement.id == achievement_id)
        result = await self.db.execute(stmt)
        achievement = result.scalar_one_or_none()

        if not achievement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Achievement not found",
            )

        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(achievement, key, value)

        await self.db.commit()
        await self.db.refresh(achievement)
        return achievement

    async def delete(self, achievement_id: uuid.UUID) -> None:
        stmt = select(Achievement).where(Achievement.id == achievement_id)
        result = await self.db.execute(stmt)
        achievement = result.scalar_one_or_none()

        if not achievement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Achievement not found",
            )

        await self.db.delete(achievement)
        await self.db.commit()