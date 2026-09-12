from typing import Optional
from pydantic import BaseModel, Field


class AchievementBase(BaseModel):
  slug: str = Field(..., max_length=50, example="konami-code")
  title: str = Field(..., max_length=100, example="Код Контами")
  description: str = Field(..., example="Введён классический чит-код на клавиатуре")
  secret_description: Optional[str] = Field(None, example="???")
  icon: str = Field(..., max_length=255, example="terminal")
  is_secret: bool = True
