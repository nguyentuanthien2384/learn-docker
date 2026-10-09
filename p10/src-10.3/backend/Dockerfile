# ------------------------------------------------------------------------------
# STAGE 1: Build source TypeScript sang JavaScript
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /nopiko-app

# Cache layer dependencies (.npmrc chứa legacy-peer-deps=true, cần cho npm ci)
COPY package*.json .npmrc ./

# Cài đặt dependencies (bao gồm cả devDependencies) để build (xóa node_modules cũ nếu có)
RUN npm ci

# Copy toàn bộ mã nguồn và tiến hành build
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runtime tối ưu dung lượng siêu nhẹ
# ------------------------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /nopiko-app

ENV NODE_ENV=production
ENV PORT=3000

# Chỉ cài đặt dependencies cần thiết cho runtime (bỏ qua devDependencies)
COPY package*.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy artifact dist từ stage builder
COPY --from=builder --chown=node:node /nopiko-app/dist ./dist

# Copy thư mục public (js/css tĩnh + avatars), main.ts đọc theo process.cwd()/public
COPY --from=builder --chown=node:node /nopiko-app/public ./public

# Copy file biến môi trường production (ConfigModule đọc .env.${NODE_ENV})
COPY --chown=node:node .env.production ./.env.production

# Chạy container bằng user non-root có sẵn trong image node:alpine
USER node

# Khai báo port ứng dụng
EXPOSE 3000

# Lệnh khởi động ứng dụng dạng exec (node là PID 1 để bắt đúng SIGTERM)
CMD ["node", "dist/main.js"]

# Build + push lên Docker Hub (chạy tại thư mục chứa Dockerfile này: D:\learn-docker\p10\src-10.3\backend):
# docker build -f Dockerfile -t thiennt2384/docker-snippet-backend:v1.0 ../../../backend-docker
# docker push thiennt2384/docker-snippet-backend:v1.0
