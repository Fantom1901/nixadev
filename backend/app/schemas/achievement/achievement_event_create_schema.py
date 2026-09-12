from typing import Optional
from pydantic import BaseModel


class AchievementEventCreate(BaseModel):
  user_agent: Optional[str] = None
  ip_hash: Optional[str] = None
