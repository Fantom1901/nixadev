import uuid
from typing import Sequence

from fastapi import APIRouter, Query, status

from app.core.database import SessionDep
from app.schemas.achievement.achievement_admin_read_schema import AchievementAdminRead
from app.schemas.achievement.achievement_create_schema import AchievementCreate
from app.service.achievement.achievement_crud_service import AchievementCRUDService
from app.schemas.achievement.achievement_event_read_schema import AchievementEventRead
from app.service.achievement.achievement_read_service import AchievementReadService
from app.schemas.achievement.achievement_update_schema import AchievementUpdate

router = APIRouter()


@router.get(
    "/",
    response_model=Sequence[AchievementAdminRead],
    status_code=status.HTTP_200_OK,
    summary="[Admin] Список всех ачивок с аналитикой",
    description="""
    Возвращает список ачивок с подробной статистикой для дашборда админки:
    * Количество всех разблокировок (`total_unlocked_count`).
    * Точное время первого и последнего открытия (`first_unlocked_at`, `last_unlocked_at`).
    """,
    responses={
        200: {"description": "Успешное получение полного списка ачивок."}
    },
)
async def get_admin_achievements(
    db: SessionDep,
) -> Sequence[AchievementAdminRead]:
    service = AchievementReadService(db)
    return await service.get_all_admin()


@router.get(
    "/events",
    response_model=Sequence[AchievementEventRead],
    status_code=status.HTTP_200_OK,
    summary="[Admin] Лог событий телеметрии",
    description="""
    Возвращает сырой лог фиксации ачивок для построения графиков и аналитики:
    * Временные ряды (time-series).
    * Распределение по браузерам/устройствам (`user_agent`).
    * Уникальные посетители (по анонимизированному `ip_hash`).
    """,
    responses={
        200: {"description": "Успешное получение списка событий телеметрии."}
    },
)
async def get_telemetry_events(
    db: SessionDep,
    limit: int = Query(100, ge=1, le=1000, description="Количество записей на страницу"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
) -> Sequence[AchievementEventRead]:
    service = AchievementReadService(db)
    return await service.get_events_for_analytics(limit=limit, offset=offset)


@router.post(
    "/",
    response_model=AchievementAdminRead,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Создать новую ачивку",
    description="Добавляет новую пасхалку или ачивку в справочник системы.",
    responses={
        201: {"description": "Ачивка успешно создана."},
        400: {
            "description": "Ачивка с таким `slug` уже существует.",
            "content": {
                "application/json": {
                    "example": {"detail": "Achievement with slug 'konami-code' already exists"}
                }
            },
        },
    },
)
async def create_achievement(
    dto: AchievementCreate,
    db: SessionDep,
) -> AchievementAdminRead:
    service = AchievementCRUDService(db)
    return await service.create(dto)


@router.patch(
    "/{achievement_id}",
    response_model=AchievementAdminRead,
    status_code=status.HTTP_200_OK,
    summary="[Admin] Обновить данные ачивки",
    description="Частичное обновление полей ачивки (название, описание, иконка, видимость).",
    responses={
        200: {"description": "Данные ачивки успешно обновлены."},
        404: {"description": "Ачивка с таким UUID не найдена."},
    },
)
async def update_achievement(
    achievement_id: uuid.UUID,
    dto: AchievementUpdate,
    db: SessionDep,
) -> AchievementAdminRead:
    service = AchievementCRUDService(db)
    return await service.update(achievement_id, dto)


@router.delete(
    "/{achievement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Удалить ачивку",
    description="Полностью удаляет ачивку и каскадно очищает все связанные с ней события телеметрии.",
    responses={
        204: {"description": "Ачивка успешно удалена."},
        404: {"description": "Ачивка с таким UUID не найдена."},
    },
)
async def delete_achievement(
    achievement_id: uuid.UUID,
    db: SessionDep,
) -> None:
    service = AchievementCRUDService(db)
    await service.delete(achievement_id)