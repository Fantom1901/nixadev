import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AchievementEventRead(BaseModel):
  id: int
  achievement_id: uuid.UUID
  unlocked_at: datetime
  user_agent: Optional[str] = None
  ip_hash: Optional[str] = None

  model_config = ConfigDict(from_attributes=True)
