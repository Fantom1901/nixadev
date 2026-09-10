from fastapi import APIRouter
from app.api.v1.endpoints import health  # Модули с ручками

from app.api.v1.endpoints.projects import router as public_projects_router
from app.api.v1.endpoints.admin.projects import router as admin_projects_router

router = APIRouter()

# Подключаем конечные эндпоинты
router.include_router(health.router, prefix="/items", tags=["Items"])

router.include_router(
    public_projects_router,
    prefix="/projects",
    tags=["Projects"]
)

# Админские роуты (/api/v1/admin/projects)
router.include_router(
    admin_projects_router,
    prefix="/admin/projects",
    tags=["Admin - Projects"]
)