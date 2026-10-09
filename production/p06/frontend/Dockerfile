# ------------------------------------------------------------------------------
# STAGE 1: Build source TypeScript + React sang static assets
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /hoidanit-app

# Cache layer dependencies
COPY package*.json ./

# Cài đặt dependencies (bao gồm cả devDependencies) để build
RUN npm ci

# Copy toàn bộ mã nguồn và tiến hành build
COPY . .

# URL của backend API, được nhúng vào bundle tĩnh tại thời điểm build (Vite).
# Mặc định để rỗng: request gọi same-origin (/api/...) và được Nginx (stage runner)
# reverse-proxy sang service "backend" trong mạng docker compose.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Serve static assets bằng Nginx
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Cấu hình Nginx hỗ trợ client-side routing (react-router BrowserRouter)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy artifact build từ stage builder
COPY --from=builder /hoidanit-app/dist /usr/share/nginx/html

# Mở cổng 80 cho HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# docker build -t p01-hoidanit-frontend .
# docker run -d --name frontend -p 8080:80 p01-hoidanit-frontend
