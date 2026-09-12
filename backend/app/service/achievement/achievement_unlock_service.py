import hashlib
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement_event_model import AchievementEvent
from app.models.achievement_model import Achievement


class AchievementUnlockService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    @staticmethod
    def _hash_ip(ip_address: Optional[str]) -> Optional[str]:
        if not ip_address:
            return None
        return hashlib.sha256(ip_address.encode("utf-8")).hexdigest()

    async def unlock_by_slug(
        self,
        slug: str,
        user_agent: Optional[str] = None,
        client_ip: Optional[str] = None,
    ) -> Achievement:
        stmt = select(Achievement).where(Achievement.slug == slug)
        result = await self.db.execute(stmt)
        achievement = result.scalar_one_or_none()

        if not achievement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Achievement with slug '{slug}' not found",
            )

        now = datetime.now(timezone.utc)
        ip_hash = self._hash_ip(client_ip)

        # 1. Запись события телеметрии
        event = AchievementEvent(
            achievement_id=achievement.id,
            unlocked_at=now,
            user_agent=user_agent[:255] if user_agent else None,
            ip_hash=ip_hash,
        )
        self.db.add(event)

        # 2. Обновление агрегированных счетчиков
        achievement.total_unlocked_count += 1
        achievement.last_unlocked_at = now
        if achievement.first_unlocked_at is None:
            achievement.first_unlocked_at = now

        await self.db.commit()
        await self.db.refresh(achievement)

        return achievement