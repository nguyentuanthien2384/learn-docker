# ==========================================
# VERSION TỐI ƯU: multi-stage build
# ==========================================

# GIAI ĐOẠN 1: Build file binary
FROM golang:1.22.5-alpine3.20 AS builder

WORKDIR /app

RUN go mod init demo-app

COPY main.go .

# Binary tĩnh, bỏ symbol/debug info (-s -w) và đường dẫn build (-trimpath) để nhỏ hơn
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o myapp main.go

# GIAI ĐOẠN 2: Chạy Production
FROM alpine:3.20.0

# Chạy bằng user thường thay vì root
RUN adduser -D -u 10001 appuser

WORKDIR /home/appuser

COPY --from=builder /app/myapp .

USER appuser

EXPOSE 8080

CMD ["./myapp"]

# chạy
# docker build -t demo-optimized-go .
# docker run -p 8080:8080 demo-optimized-go
