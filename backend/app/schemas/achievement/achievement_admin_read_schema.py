from datetime import datetime
from typing import Optional
from pydantic import ConfigDict
from app.schemas.achievement.achievement_public_read_schema import AchievementPublicRead


class AchievementAdminRead(AchievementPublicRead):
  first_unlocked_at: Optional[datetime] = None
  last_unlocked_at: Optional[datetime] = None
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)
