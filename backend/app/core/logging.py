import sys
import logging
import traceback
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


def format_record(record):
  """Форматтер, вырезающий чужие библиотеки из traceback."""
  format_string = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>\n"
  )

  exception = record.get("exception")
  if exception is not None:
    exc_type, exc_value, exc_tb = exception
    # Фильтруем фреймы: оставляем только те, где НЕТ site-packages
    filtered_tb = [
      frame for frame in traceback.extract_tb(exc_tb)
      if "site-packages" not in frame.filename
    ]

    record["extra"]["clean_err"] = (
      f"<red>{exc_type.__name__}: {exc_value}</red>\n"
      + "".join(traceback.format_list(filtered_tb))
    )
    # Отключаем стандартный вывод исключения Loguru, так как выводим отфильтрованный
    record["exception"] = None
    format_string += "{extra[clean_err]}"

  return format_string


def setup_logging():
  logger.remove()

  logger.add(
    sys.stdout,
    format=format_record,
    level="INFO",
    colorize=True,
    backtrace=False,
    diagnose=False,
  )

  for log_name in ("uvicorn", "uvicorn.access", "sqlalchemy.engine"):
    mod_logger = logging.getLogger(log_name)
    mod_logger.handlers = [InterceptHandler()]

  return logger