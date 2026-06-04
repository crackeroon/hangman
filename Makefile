.PHONY: help build up down logs clean

help:
	@echo "Доступные команды:"
	@echo "  make build    - Собрать Docker образы"
	@echo "  make up       - Запустить все сервисы"
	@echo "  make down     - Остановить все сервисы"
	@echo "  make logs     - Показать логи"
	@echo "  make clean    - Очистить контейнеры и образы"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "✅ Приложение запущено!"
	@echo "📱 Фронтенд: http://localhost"
	@echo "🔌 Бекенд API: http://localhost:8080/api/health"

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f