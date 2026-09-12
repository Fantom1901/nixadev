from typing import Sequence

from fastapi import APIRouter, Request, status

from app.core.database import SessionDep
from app.schemas.achievement.achievement_public_read_schema import AchievementPublicRead
from app.service.achievement.achievement_read_service import AchievementReadService
from app.service.achievement.achievement_unlock_service import AchievementUnlockService

router = APIRouter()


@router.get(
  "/",
  response_model=Sequence[AchievementPublicRead],
  status_code=status.HTTP_200_OK,
  summary="Получить публичный список ачивок",
  description="""
    Возвращает полный каталог доступных ачивок на сайте.

    * **Использование на фронтенде:** Сопоставляется с массивом разблокированных `slug` из `localStorage`.
    * **Приватность:** Не раскрывает внутреннюю аналитику и временные метки.
    """,
  responses={
    200: {
      "description": "Успешное получение списка ачивок.",
    }
  },
)
async def get_public_achievements(
  db: SessionDep,
) -> Sequence[AchievementPublicRead]:
  service = AchievementReadService(db)
  return await service.get_all_public()


@router.post(
  "/{slug}/unlock",
  response_model=AchievementPublicRead,
  status_code=status.HTTP_200_OK,
  summary="Зафиксировать разблокировку ачивки",
  description="""
    Вызывается фронтендом в фоновом режиме при обнаружении пасхалки.

    * **Параметры:** `slug` — уникальный текстовый идентификатор ачивки (`konami-code`, `night-owl` и т.д.).
    * **Телеметрия:** Автоматически извлекает `User-Agent` и IP-адрес (хешируется в SHA-256) для аналитики.
    * **Счётчики:** Инкрементирует общий счётчик разблокировок в базе данных.
    """,
  responses={
    200: {
      "description": "Ачивка успешно найдена и факт разблокировки зафиксирован.",
    },
    404: {
      "description": "Ачивка с указанным `slug` не найдена в базе данных.",
      "content": {
        "application/json": {
          "example": {"detail": "Achievement with slug 'unknown-slug' not found"}
        }
      },
    },
  },
)
async def unlock_achievement(
  slug: str,
  request: Request,
  db: SessionDep,
) -> AchievementPublicRead:
  user_agent = request.headers.get("user-agent")
  client_ip = request.client.host if request.client else None

  service = AchievementUnlockService(db)
  return await service.unlock_by_slug(
    slug=slug,
    user_agent=user_agent,
    client_ip=client_ip,
  )