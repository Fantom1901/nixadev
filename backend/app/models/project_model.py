from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import String, Text, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Project(Base):
  __tablename__ = "projects"

  id: Mapped[UUID] = mapped_column(
    PG_UUID(as_uuid=True), primary_key=True, default=uuid4
  )

  title: Mapped[str] = mapped_column(String(150), nullable=False)
  slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
  summary: Mapped[str] = mapped_column(String(300), nullable=False)
  description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
  cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

  github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
  demo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

  stack: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)

  is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
  is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
  order: Mapped[int] = mapped_column(Integer, default=0)

  views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  github_clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  demo_clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now(), nullable=False
  )
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
  )
