import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Achievement(Base):
  __tablename__ = "achievements"

  id: Mapped[uuid.UUID] = mapped_column(
    primary_key=True,
    default=uuid.uuid4,
  )
  slug: Mapped[str] = mapped_column(
    String(50),
    unique=True,
    index=True,
    nullable=False,
  )
  title: Mapped[str] = mapped_column(
    String(100),
    nullable=False,
  )
  description: Mapped[str] = mapped_column(
    Text,
    nullable=False,
  )
  secret_description: Mapped[Optional[str]] = mapped_column(
    Text,
    nullable=True,
  )
  icon: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
  )
  is_secret: Mapped[bool] = mapped_column(
    Boolean,
    default=True,
    nullable=False,
  )

  # Telemetry aggregate fields
  total_unlocked_count: Mapped[int] = mapped_column(
    Integer,
    default=0,
    nullable=False,
  )
  first_unlocked_at: Mapped[Optional[datetime]] = mapped_column(
    DateTime(timezone=True),
    nullable=True,
  )
  last_unlocked_at: Mapped[Optional[datetime]] = mapped_column(
    DateTime(timezone=True),
    nullable=True,
  )
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  # Relationships
  events: Mapped[List["AchievementEvent"]] = relationship(
    back_populates="achievement",
    cascade="all, delete-orphan",
  )
