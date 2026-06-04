# Этап сборки
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Копируем go.mod и go.sum
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение
RUN go build -o backend main.go

# Финальный этап
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Копируем бинарный файл из этапа сборки
COPY --from=builder /app/backend .

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["./backend"]