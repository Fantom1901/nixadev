# app/core/middleware.py
import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware


def setup_middlewares(app: FastAPI) -> None:
  # 1. CORS
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  # 2. GZip
  app.add_middleware(GZipMiddleware, minimum_size=1000)

  # 3. Custom Process Time & Request ID
  @app.middleware("http")
  async def add_telemetry_headers(request: Request, call_next):
    start_time = time.perf_counter()
    request_id = str(uuid.uuid4())

    response = await call_next(request)

    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    response.headers["X-Request-ID"] = request_id
    return response