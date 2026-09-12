import uuid
from pydantic import ConfigDict
from app.schemas.achievement.achievement_base_schema import AchievementBase

class AchievementPublicRead(AchievementBase):
  id: uuid.UUID
  total_unlocked_count: int

  model_config = ConfigDict(from_attributes=True)
