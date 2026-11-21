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


def get_compose_file(env: str) -> Path:
    return PROD_COMPOSE if env == "prod" else DEV_COMPOSE


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(f"{CYAN}Использование:{NC} ./manage.py [dev|prod|stop|logs|migrate|makemigrations|init-admin|build|rebuild|restart]")
        sys.exit(0)

    action = sys.argv[1].strip()
    target_env = sys.argv[2].strip() if len(sys.argv) > 2 and sys.argv[2] in ("dev", "prod") else "dev"
    compose_file = get_compose_file(target_env)

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
        service = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] not in ("dev", "prod") else ""
        cmd = ["docker", "compose", "-f", str(DEV_COMPOSE), "logs", "-f"]
        if service:
            cmd.append(service)
        run(cmd)

    elif action == "migrate":
        print(f"{CYAN}🔄 Применение миграций Alembic...{NC}")
        run(["docker", "compose", "-f", str(DEV_COMPOSE), "exec", "backend", "alembic", "upgrade", "head"])

    elif action == "makemigrations":
        message = sys.argv[2] if len(sys.argv) > 2 else "auto_migration"
        print(f"{CYAN}📝 Создание новой миграции Alembic: '{message}'...{NC}")
        run(["docker", "compose", "-f", str(DEV_COMPOSE), "exec", "backend", "alembic", "revision", "--autogenerate", "-m", message])


    elif action == "init-admin":
      print(f"{CYAN}👤 Инициализация суперадмина...{NC}")
      run(["docker", "compose", "-f", str(DEV_COMPOSE), "exec", "-it", "backend", "python", "-m",
           "app.scripts.init_admin"])

    elif action == "build":
        print(f"{YELLOW}📦 Пересборка контейнеров ({target_env})...{NC}")
        run(["docker", "compose", "-f", str(compose_file), "build"])

    elif action == "rebuild":
        print(f"{YELLOW}🔄 Полная пересборка и перезапуск ({target_env})...{NC}")
        detach = ["-d"] if target_env == "prod" else []
        run(["docker", "compose", "-f", str(compose_file), "up", "--build", "--force-recreate"] + detach)

    elif action == "restart":
        print(f"{YELLOW}♻️ Перезапуск контейнеров без пересборки ({target_env})...{NC}")
        run(["docker", "compose", "-f", str(compose_file), "restart"])

    else:
        print(f"{RED}Неизвестная команда: {action}{NC}")


if __name__ == "__main__":
    main()