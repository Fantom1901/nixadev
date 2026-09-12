import importlib
import pkgutil
from pathlib import Path

# Динамически импортируем все Python-файлы в текущем пакете (app/models)
package_dir = Path(__file__).resolve().parent

for _, module_name, is_pkg in pkgutil.iter_modules([str(package_dir)]):
  if not is_pkg:
    importlib.import_module(f"{__name__}.{module_name}")
