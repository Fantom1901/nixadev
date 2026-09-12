import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AchievementEvent(Base):
  __tablename__ = "achievement_events"

  id: Mapped[int] = mapped_column(
    BigInteger,
    primary_key=True,
    autoincrement=True,
  )
  achievement_id: Mapped[uuid.UUID] = mapped_column(
    ForeignKey("achievements.id", ondelete="CASCADE"),
    nullable=False,
    index=True,
  )
  unlocked_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
    index=True,
  )
  user_agent: Mapped[Optional[str]] = mapped_column(
    String(255),
    nullable=True,
  )
  ip_hash: Mapped[Optional[str]] = mapped_column(
    String(64),
    nullable=True,
    index=True,
  )

  # Relationships
  achievement: Mapped["Achievement"] = relationship(
    back_populates="events",
  )
