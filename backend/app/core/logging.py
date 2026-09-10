import sys
import logging
from loguru import logger

class InterceptHandler(logging.Handler):
    """Перехватчик стандартных логов Python (Uvicorn, SQLAlchemy) и передача их в Loguru."""
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == __file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logging():
    # Удаляем стандартные хэндлеры loguru
    logger.remove()

    # Формат вывода в консоль
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # 1. Вывод в stdout (консоль / docker logs)
    logger.add(sys.stdout, format=log_format, level="INFO", colorize=True)

    # 2. Перехватываем логи Uvicorn и SQLAlchemy
    for log_name in ("uvicorn", "uvicorn.access", "sqlalchemy.engine"):
        mod_logger = logging.getLogger(log_name)
        mod_logger.handlers = [InterceptHandler()]

    return logger