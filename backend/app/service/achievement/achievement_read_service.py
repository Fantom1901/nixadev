from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement_event_model import AchievementEvent
from app.models.achievement_model import Achievement


class AchievementReadService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all_public(self) -> Sequence[Achievement]:
        stmt = select(Achievement).order_by(Achievement.created_at.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_all_admin(self) -> Sequence[Achievement]:
        stmt = select(Achievement).order_by(Achievement.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_events_for_analytics(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> Sequence[AchievementEvent]:
        stmt = (
            select(AchievementEvent)
            .order_by(AchievementEvent.unlocked_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()