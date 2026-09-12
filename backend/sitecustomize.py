import sys
import traceback


def custom_excepthook(exc_type, exc_value, exc_tb):
  # Фильтруем все системные пути /usr/local/lib
  tb_list = traceback.extract_tb(exc_tb)
  filtered_tb = [
    frame for frame in tb_list
    if "/usr/local/lib/" not in frame.filename and "site-packages" not in frame.filename
  ]

  # Если ошибка произошла полностью внутри стороннего пакета, оставляем последний фрейм
  if not filtered_tb and tb_list:
    filtered_tb = [tb_list[-1]]

  print("\n❌ ОШИБКА В КОДЕ:", file=sys.stderr)
  for frame in filtered_tb:
    print(f'  File "{frame.filename}", line {frame.lineno}, in {frame.name}', file=sys.stderr)
    print(f'    {frame.line}', file=sys.stderr)
  print(f"{exc_type.__name__}: {exc_value}\n", file=sys.stderr)


sys.excepthook = custom_excepthook