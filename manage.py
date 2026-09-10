#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path

# Жестко определяем корень проекта (где и лежит manage.py)
ROOT_DIR = Path(__file__).resolve().parent

DEV_COMPOSE = ROOT_DIR / "docker-compose.dev.yaml"
PROD_COMPOSE = ROOT_DIR / "docker-compose.yaml"

CYAN = "\033[0;36m"
YELLOW = "\033[1;33m"
GREEN = "\033[0;32m"
RED = "\033[0;31m"
NC = "\033[0m"


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=ROOT_DIR)


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(f"{CYAN}Использование:{NC} ./manage.py [dev|prod|stop|logs|migrate|build]")
        sys.exit(0)

    action = sys.argv[1].strip()

    if action == "dev":
        print(f"{CYAN}🚀 Запуск DEV-окружения (с hot-reload)...{NC}")
        try:
            run(["docker", "compose", "-f", str(DEV_COMPOSE), "up"])
        except KeyboardInterrupt:
            print("\n👋 Завершение работы...")

    elif action == "prod":
        print(f"{GREEN}🚀 Запуск PROD-окружения...{NC}")
        run(["docker", "compose", "-f", str(PROD_COMPOSE), "up", "-d"])

    elif action == "stop":
        print(f"{YELLOW}🛑 Остановка всех окружений...{NC}")
        run(["docker", "compose", "-f", str(DEV_COMPOSE), "down"])
        run(["docker", "compose", "-f", str(PROD_COMPOSE), "down"])

    elif action == "logs":
        service = sys.argv[2] if len(sys.argv) > 2 else ""
        cmd = ["docker", "compose", "-f", str(DEV_COMPOSE), "logs", "-f"]
        if service:
            cmd.append(service)
        run(cmd)

    elif action == "migrate":
        print(f"{CYAN}🔄 Применение миграций Alembic...{NC}")
        run(["docker", "compose", "-f", str(DEV_COMPOSE), "exec", "backend", "alembic", "upgrade", "head"])

    elif action == "build":
        print(f"{YELLOW}📦 Пересборка контейнеров...{NC}")
        run(["docker", "compose", "-f", str(DEV_COMPOSE), "build"])

    else:
        print(f"{RED}Неизвестная команда: {action}{NC}")


if __name__ == "__main__":
    main()