import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rich.traceback import install

from app.api.router import api_router
from app.core.logging import setup_logging
from app.core.middleware import setup_middlewares

# Отсекаем фреймы сторонних библиотек из стектрейсов
install(
    show_locals=False,
    suppress=[
        "asyncio",
        "uvicorn",
        "sqlalchemy",
        "starlette",
        "fastapi",
        "pydantic",
    ],
)

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
  # Действия при старте
  logger.info("=" * 50)
  logger.info("🚀 Nixa Dev API успешно запущен!")
  logger.info("📌 Документация и эндпоинты:")
  logger.info("   • Swagger UI:   http://localhost:8000/docs")
  logger.info("   • ReDoc:        http://localhost:8000/redoc")
  logger.info("   • OpenAPI Spec: http://localhost:8000/openapi.json")
  logger.info("=" * 50)

  yield

  # Действия при завершении
  logger.info("👋 Остановка бэкенда Nixa Dev...")


app = FastAPI(
  title="NixaDev API",
  docs_url="/docs",
  redoc_url="/redoc",
  openapi_url="/openapi.json",
  lifespan=lifespan,
)

setup_middlewares(app)


# Логирование запросов с замером времени execution
@app.middleware("http")
async def log_requests(request: Request, call_next):
  start_time = time.perf_counter()
  method = request.method
  path = request.url.path

  logger.info(f"➡️  {method} {path}")

  try:
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000
    status_code = response.status_code

    # Подсвечиваем статус-коды по смыслу
    log_msg = f"⬅️  {method} {path} [{status_code}] — {process_time:.2f}ms"
    if status_code >= 400:
      logger.warning(log_msg)
    else:
      logger.info(log_msg)

    return response
  except Exception as exc:
    process_time = (time.perf_counter() - start_time) * 1000
    # Пишем краткий лог без дублирования огромного traceback (его подхватит exception handler или rich)
    logger.error(f"💥 {method} {path} упал с ошибкой за {process_time:.2f}ms: {exc}")
    raise exc


# --- EXCEPTION HANDLERS ---

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
  """Ловит любые неперехваченные падения и отдает аккуратный JSON."""
  # В logger.error передаем сам exc, rich/loguru отформатирует его без лишней лапши
  logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={"detail": "Внутренняя ошибка сервера. Мы уже разбираемся!"},
  )


# --- ROUTERS ---

app.include_router(api_router, prefix="/api")