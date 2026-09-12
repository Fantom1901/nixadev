from typing import Optional
from pydantic import BaseModel, Field


class AchievementUpdate(BaseModel):
  title: Optional[str] = Field(None, max_length=100)
  description: Optional[str] = None
  secret_description: Optional[str] = None
  icon: Optional[str] = Field(None, max_length=255)
  is_secret: Optional[bool] = None
