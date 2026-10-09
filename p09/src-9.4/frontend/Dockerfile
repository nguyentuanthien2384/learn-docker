# ------------------------------------------------------------------------------
# STAGE 1: Build source TypeScript + React sang static assets
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /nopiko-app

# Cache layer dependencies (.npmrc chứa legacy-peer-deps=true, cần cho npm ci)
COPY package*.json .npmrc ./

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

# Cấu hình Nginx hỗ trợ client-side routing (react-router BrowserRouter).
# Lấy nginx.conf (listen 8080) từ build context phụ "docker-config" = p09/src-9.4/frontend,
# vì context chính là frontend-docker, nơi nginx.conf vẫn listen 80 cho các bài trước.
COPY --from=docker-config nginx.conf /etc/nginx/conf.d/default.conf

# Copy artifact build từ stage builder, thuộc sở hữu user "nginx" có sẵn trong base image
COPY --from=builder --chown=nginx:nginx /nopiko-app/dist /usr/share/nginx/html

# Cho phép user non-root "nginx" ghi thư mục cache của nginx lúc runtime, và đổi
# vị trí pid file sang /tmp (thư mục /run mặc định không cho user này ghi)
RUN chown -R nginx:nginx /var/cache/nginx && \
    sed -i 's#pid\s*/run/nginx.pid;#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf

# Chạy container bằng user non-root có sẵn trong image nginx:alpine
USER nginx

# Nghe ở cổng >1024 (không phải cổng đặc quyền) để user non-root bind được mà không cần quyền root
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

# Build thủ công (chạy tại thư mục gốc D:\learn-docker):
# docker build -f p09/src-9.4/frontend/Dockerfile --build-context docker-config=p09/src-9.4/frontend -t p01-nopiko-frontend frontend-docker
# docker run -d --name frontend -p 8080:8080 p01-nopiko-frontend
