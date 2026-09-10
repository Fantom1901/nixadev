from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl, ConfigDict


# --- BASE SCHEMA ---
class ProjectBase(BaseModel):
    title: str = Field(..., max_length=150, example="College Flow")
    slug: str = Field(..., max_length=150, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", example="college-flow")
    summary: str = Field(..., max_length=300, example="Автоматизация дежурств и расписания в колледже")
    description: Optional[str] = Field(None, example="Подробное описание в Markdown...")
    cover_image: Optional[str] = Field(None, example="https://s3.nixadev.ru/covers/college-flow.webp")
    github_url: Optional[str] = Field(None, example="https://github.com/niksa/college-flow")
    demo_url: Optional[str] = Field(None, example="https://college-flow.ru")
    stack: List[str] = Field(default_factory=list, example=["FastAPI", "Next.js", "Docker"])
    is_published: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    order: int = Field(default=0)


# --- ADMIN SCHEMAS ---
class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    slug: Optional[str] = Field(None, max_length=150, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    cover_image: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    stack: Optional[List[str]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    order: Optional[int] = None


class ProjectAdminResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    views_count: int
    github_clicks: int
    demo_clicks: int
    created_at: datetime
    updated_at: datetime


# --- PUBLIC SCHEMAS ---
class ProjectPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    summary: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    stack: List[str]
    is_featured: bool
    order: int
    created_at: datetime


class MetricTypeEnum(str):
    VIEW = "view"
    GITHUB = "github"
    DEMO = "demo"