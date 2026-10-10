<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original-wordmark.svg" width="120" alt="Docker Logo" />
</p>

<h1 align="center">🐳 Learn Docker — From Zero to Production</h1>

<p align="center">
  <strong>Hành trình học Docker từ cơ bản đến triển khai Production thực tế</strong><br/>
  <em>Dockerfile · Multi-stage Build · Docker Compose · Volumes · Networking · Docker Hub</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📑 Mục Lục

- [🎯 Giới thiệu](#-giới-thiệu)
- [🏗️ Kiến trúc tổng quan](#️-kiến-trúc-tổng-quan)
- [📂 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [🧩 Chi tiết từng module](#-chi-tiết-từng-module)
  - [P01 — Dockerfile cơ bản (Node.js + Express)](#p01--dockerfile-cơ-bản-nodejs--express)
  - [P02 — Multi-stage Build (Go)](#p02--multi-stage-build-go)
  - [Backend Docker — NestJS API Server](#backend-docker--nestjs-api-server)
  - [Frontend Docker — React + Vite + Nginx](#frontend-docker--react--vite--nginx)
  - [P09 — Docker Compose](#p09--docker-compose)
  - [P10 — Docker Hub Deployment](#p10--docker-hub-deployment)
  - [Production — Triển khai Production](#production--triển-khai-production)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [📖 Các khái niệm Docker được đề cập](#-các-khái-niệm-docker-được-đề-cập)
- [🤝 Đóng góp](#-đóng-góp)
- [📄 Giấy phép](#-giấy-phép)

---

## 🎯 Giới thiệu

> **Learn Docker** là repository tổng hợp toàn bộ kiến thức và bài thực hành Docker — từ những bước đầu tiên viết `Dockerfile` cho đến triển khai ứng dụng full-stack lên production với `Docker Compose`, `Docker Hub`, `Volumes`, `Networking`, `Health Checks` và nhiều hơn nữa.

Repository được tổ chức theo các **phần (parts)** tương ứng từng chủ đề, giúp bạn học tuần tự hoặc nhảy thẳng đến phần quan tâm.

### ✨ Bạn sẽ học được gì?

| # | Chủ đề | Mô tả |
|:-:|--------|-------|
| 🐳 | **Dockerfile** | Viết Dockerfile cho Node.js, Go — hiểu `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD` |
| 🏗️ | **Multi-stage Build** | Tối ưu image size: so sánh single-stage (~250MB) vs multi-stage (~15MB) |
| 📦 | **Volumes** | Persist dữ liệu với Named Volumes & Bind Mounts |
| 🌐 | **Networking** | Kết nối containers với nhau qua Docker Network |
| 🎼 | **Docker Compose** | Quản lý multi-container apps (Frontend + Backend + DB + pgAdmin) |
| ❤️‍🩹 | **Health Checks** | Đảm bảo container sẵn sàng trước khi phụ thuộc khởi động |
| 🚀 | **Docker Hub** | Push/Pull images lên Docker Hub để deploy mọi nơi |
| 🏭 | **Production** | Quy trình triển khai production thực tế với Nginx reverse proxy |

---

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER HOST                              │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │    │   Backend    │    │  PostgreSQL  │       │
│  │  React+Vite  │───▶│   NestJS     │───▶│    17-alpine │       │
│  │  Nginx :80   │    │   :3000      │    │    :5432     │       │
│  └──────┬───────┘    └──────────────┘    └──────────────┘       │
│         │                                       │               │
│         │ reverse proxy (/api/)                 │               │
│         ▼                                       ▼               │
│  ┌──────────────┐                        ┌──────────────┐       │
│  │  User :4173  │                        │   pgAdmin    │       │
│  │  (browser)   │                        │    :5050     │       │
│  └──────────────┘                        └──────────────┘       │
│                                                                 │
│  Named Volumes: todos-data · postgres-data · pgadmin-data       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc thư mục

```
learn-docker/
│
├── 📁 p01/                        # Part 01 — Dockerfile cơ bản
│   ├── Dockerfile                 # Image Node.js Express
│   ├── package.json
│   └── src/
│       └── server.js              # Express MVC + SSR
│
├── 📁 p02/                        # Part 02 — Multi-stage Build
│   ├── Dockerfile                 # ✅ Multi-stage (optimized ~15MB)
│   ├── Dockerfile.heavy           # ❌ Single-stage (heavy ~250MB+)
│   └── main.go                    # Go HTTP server
│
├── 📁 backend-docker/             # Full Backend Application
│   ├── Dockerfile                 # Production Dockerfile
│   ├── Dockerfile.simple          # Simplified production build
│   ├── Dockerfile.postgres        # Custom PostgreSQL image
│   ├── .env.development           # Biến môi trường dev
│   ├── .env.production            # Biến môi trường prod
│   └── src/
│       ├── main.ts                # Entry point NestJS
│       ├── features/
│       │   ├── auth/              # 🔐 Authentication (JWT + Passport)
│       │   ├── users/             # 👤 User management
│       │   ├── snippets/          # 📝 Code snippets CRUD
│       │   └── tags/              # 🏷️ Tags management
│       ├── todos/                 # ✅ Todo list
│       ├── database/              # 🗄️ TypeORM config
│       └── views/                 # 🖥️ Handlebars SSR templates
│
├── 📁 frontend-docker/            # Full Frontend Application
│   ├── Dockerfile                 # Multi-stage: Vite build → Nginx
│   ├── nginx.conf                 # Nginx reverse proxy config
│   ├── vite.config.ts             # Vite configuration
│   └── src/
│       ├── App.tsx                # Root component
│       └── features/
│           ├── auth/              # 🔐 Login / Register
│           ├── dashboard/         # 📊 Dashboard
│           ├── snippets/          # 📝 Snippets viewer
│           ├── create/            # ➕ Create snippet
│           ├── profile/           # 👤 User profile
│           ├── users/             # 👥 Users list
│           ├── home/              # 🏠 Landing page
│           └── prompt-lab/        # 🧪 Prompt Lab
│
├── 📁 p09/                        # Part 09 — Docker Compose
│   ├── src-9.2/
│   │   └── docker-compose.full.yaml    # Compose cơ bản (4 services)
│   ├── src-9.3/
│   │   └── docker-compose.full.yaml    # + Health Checks
│   └── src-9.4/
│       └── ...                         # Compose nâng cao
│
├── 📁 p10/                        # Part 10 — Docker Hub
│   ├── src-10.3/
│   │   ├── backend/Dockerfile          # Custom Dockerfile cho Hub
│   │   └── frontend/Dockerfile         # Custom Dockerfile cho Hub
│   └── src-10.4/
│       └── docker-compose.dockerhub.yaml  # Deploy từ Docker Hub images
│
└── 📁 production/                 # Production Deployments
    ├── p03/
    │   └── docker-compose.yaml    # Backend standalone (no DB)
    ├── p04/
    │   └── docker-compose.yaml    # Backend + Named Volumes
    ├── p05/
    │   └── docker-compose.yaml    # Backend + PostgreSQL
    └── p06/
        ├── frontend/
        │   ├── Dockerfile         # Frontend production build
        │   └── nginx.conf         # Nginx config with reverse proxy
        └── production/
            ├── docker-compose.yaml       # Backend + DB
            └── docker-compose.full.yaml  # Full stack (4 services)
```

---

## 🧩 Chi tiết từng module

### P01 — Dockerfile cơ bản (Node.js + Express)

> 📌 **Mục tiêu:** Viết Dockerfile đầu tiên, đóng gói ứng dụng Express vào Docker image.

| Thuộc tính | Giá trị |
|------------|---------|
| **Ngôn ngữ** | JavaScript (CommonJS) |
| **Framework** | Express 5 + EJS template |
| **Base image** | `node:24-alpine` |
| **Port** | `3000` |
| **Tính năng** | MVC pattern, Server-Side Rendering |

**Các lệnh chính:**

```bash
# Build image
docker build -t p01-nopiko:1.0 .

# Chạy container
docker run -d -p 3000:3000 --name express-nopiko p01-nopiko:1.0
```

**Kiến thức học được:**
- Viết `Dockerfile` cơ bản với các instruction: `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, `CMD`
- Tối ưu cache layer bằng cách `COPY package.json` trước khi `COPY .`
- Sử dụng `--omit=dev` để giảm kích thước image

---

### P02 — Multi-stage Build (Go)

> 📌 **Mục tiêu:** So sánh single-stage vs multi-stage build, tối ưu Docker image size.

| Dockerfile | Kỹ thuật | Kích thước ước tính |
|------------|----------|:------------------:|
| `Dockerfile.heavy` | Single-stage (chứa Go toolchain) | **~250MB+** ❌ |
| `Dockerfile` | Multi-stage (chỉ binary) | **~15MB** ✅ |

**Go HTTP Server cung cấp 3 endpoints:**

| Endpoint | Mô tả |
|----------|--------|
| `GET /` | Trang chủ — hiện hostname (container ID) |
| `GET /health` | Health check — trả về `{"status": "ok"}` |
| `GET /info` | Thông tin hệ thống (hostname, go version, OS, arch, uptime) |

**So sánh build:**

```bash
# Single-stage (nặng)
docker build -f Dockerfile.heavy -t demo-heavy .
docker run -p 8081:8080 demo-heavy

# Multi-stage (tối ưu)
docker build -t demo-optimized-go .
docker run -p 8080:8080 demo-optimized-go

# So sánh kích thước
docker images | findstr demo
```

**Kỹ thuật tối ưu trong multi-stage:**
- `CGO_ENABLED=0` — static binary, không cần C libraries
- `-ldflags="-s -w"` — bỏ symbol/debug info
- `-trimpath` — bỏ đường dẫn build
- Sử dụng `alpine:3.20.0` làm runtime base (thay vì `golang:1.22.5`)
- Chạy bằng non-root user (`appuser`) cho bảo mật

---

### Backend Docker — NestJS API Server

> 📌 **Mục tiêu:** Ứng dụng backend thực tế, đầy đủ tính năng, sẵn sàng cho production.

| Thuộc tính | Giá trị |
|------------|---------|
| **Framework** | NestJS 12 |
| **Ngôn ngữ** | TypeScript 6 |
| **Database** | PostgreSQL 17 (via TypeORM) |
| **Auth** | JWT + Passport |
| **Testing** | Vitest + Supertest |
| **Linting** | OxLint |
| **Template** | Handlebars (SSR) |

**🔐 Features:**

| Module | Chức năng |
|--------|-----------|
| `auth` | Đăng ký, đăng nhập, JWT access/refresh token |
| `users` | CRUD người dùng, quản lý profile |
| `snippets` | Tạo, đọc, sửa, xóa code snippets |
| `tags` | Gắn nhãn và phân loại snippets |
| `todos` | Quản lý danh sách công việc (file-based hoặc DB) |

**Dockerfiles:**

| File | Mục đích |
|------|----------|
| `Dockerfile` | Production build đầy đủ |
| `Dockerfile.simple` | Production build đơn giản hóa |
| `Dockerfile.postgres` | Custom PostgreSQL image với default credentials |

---

### Frontend Docker — React + Vite + Nginx

> 📌 **Mục tiêu:** Build ứng dụng React SPA thành static assets, serve bằng Nginx với reverse proxy.

| Thuộc tính | Giá trị |
|------------|---------|
| **Framework** | React 19 |
| **Build tool** | Vite 8 |
| **Styling** | TailwindCSS 4 |
| **Router** | React Router 7 |
| **Web server** | Nginx 1.27 (alpine) |
| **Testing** | Vitest + Testing Library |

**🎨 Features:**

| Page | Mô tả |
|------|--------|
| 🏠 Home | Landing page |
| 🔐 Auth | Đăng ký / Đăng nhập |
| 📊 Dashboard | Tổng quan |
| 📝 Snippets | Xem danh sách code snippets |
| ➕ Create | Tạo snippet mới |
| 👤 Profile | Quản lý thông tin cá nhân |
| 👥 Users | Danh sách người dùng |
| 🧪 Prompt Lab | Thử nghiệm prompt |

**Multi-stage Dockerfile:**

```
Stage 1 (builder): node:24-alpine → npm ci → vite build → dist/
                                    ↓
Stage 2 (runner):  nginx:1.27-alpine → COPY dist → COPY nginx.conf → serve :80
```

**Nginx Reverse Proxy:**
- `/api/*` → proxy sang `http://backend:3000` (service trong Docker network)
- `/*` → serve static files + SPA fallback (`try_files ... /index.html`)

---

### P09 — Docker Compose

> 📌 **Mục tiêu:** Quản lý ứng dụng multi-container bằng Docker Compose.

#### src-9.2 — Compose cơ bản

4 services được orchestrate cùng nhau:

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Frontend  │────▶│  Backend   │────▶│ PostgreSQL │◀────│  pgAdmin   │
│   :4173    │     │   :3000    │     │   :5432    │     │   :5050    │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
```

```bash
docker compose -f docker-compose.full.yaml up -d --build
```

#### src-9.3 — Thêm Health Checks

Cải tiến từ 9.2 với **health checks** và **điều kiện phụ thuộc**:

| Service | Health Check | Depends On |
|---------|-------------|------------|
| `frontend` | `wget http://127.0.0.1:80/` | backend (healthy) |
| `backend` | `wget http://127.0.0.1:3000/` | database (healthy) |
| `database` | `pg_isready -U nopiko -d dockersnippet` | — |
| `pgadmin` | — | database (healthy) |

**Thứ tự khởi động đảm bảo:** `database` → `backend` → `frontend` + `pgadmin`

---

### P10 — Docker Hub Deployment

> 📌 **Mục tiêu:** Push images lên Docker Hub và deploy từ registry.

**Workflow:**

```
Local Build → docker push → Docker Hub Registry → docker pull → Any Server
```

**Deploy từ Docker Hub (không cần source code):**

```bash
# Pull images
docker compose -f docker-compose.dockerhub.yaml pull

# Khởi động toàn bộ stack
docker compose -f docker-compose.dockerhub.yaml up -d
```

**Docker Hub Images:**
- `thiennt2384/docker-snippet-frontend:v1.0`
- `thiennt2384/docker-snippet-backend:v1.0`

---

### Production — Triển khai Production

> 📌 **Mục tiêu:** Học quy trình triển khai production theo từng bước, từ đơn giản đến phức tạp.

| Part | Cấu hình | Mô tả |
|:----:|----------|--------|
| **p03** | Backend only | Backend standalone, DB tắt (`DB_ENABLED=false`) |
| **p04** | Backend + Volume | Thêm Named Volume cho data persistence |
| **p05** | Backend + PostgreSQL | Kết nối PostgreSQL, DB bật (`DB_ENABLED=true`) |
| **p06** | Full Stack | Frontend (Nginx) + Backend + PostgreSQL + pgAdmin + Custom Postgres Dockerfile |

**Tiến trình học:**

```
p03 (đơn giản)  →  p04 (+ volumes)  →  p05 (+ database)  →  p06 (full stack)
       │                   │                    │                     │
   1 service          1 service +          2 services           4 services
   no persistence     named volume        + networking       + reverse proxy
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="150">

**Containerization**

</td>
<td align="center" width="150">

**Backend**

</td>
<td align="center" width="150">

**Frontend**

</td>
<td align="center" width="150">

**Database**

</td>
<td align="center" width="150">

**DevOps**

</td>
</tr>
<tr>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="40" /><br/>Docker
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" width="40" /><br/>NestJS 12
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40" /><br/>React 19
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="40" /><br/>PostgreSQL 17
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" width="40" /><br/>Nginx
</td>
</tr>
<tr>
<td align="center">
  Docker Compose
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40" /><br/>TypeScript 6
</td>
<td align="center">
  <img src="https://vitejs.dev/logo.svg" width="40" /><br/>Vite 8
</td>
<td align="center">
  TypeORM
</td>
<td align="center">
  Docker Hub
</td>
</tr>
<tr>
<td align="center">
  Docker Hub
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg" width="40" /><br/>Go 1.22
</td>
<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="40" /><br/>TailwindCSS 4
</td>
<td align="center">
  pgAdmin 4
</td>
<td align="center">
  Health Checks
</td>
</tr>
</table>

---

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (bao gồm Docker Engine + Docker Compose)
- Git

### 1️⃣ Clone repository

```bash
git clone https://github.com/nguyentuanthien2384/learn-docker.git
cd learn-docker
```

### 2️⃣ Chạy ứng dụng full-stack (nhanh nhất)

```bash
# Từ thư mục gốc, vào production p06
cd production/p06/production

# Build & khởi động toàn bộ 4 services
docker compose -f docker-compose.full.yaml up -d --build
```

### 3️⃣ Truy cập ứng dụng

| Service | URL | Mô tả |
|---------|-----|--------|
| 🌐 Frontend | [http://localhost:4173](http://localhost:4173) | Giao diện React |
| 🔧 Backend API | [http://localhost:3000](http://localhost:3000) | NestJS REST API |
| 🗄️ pgAdmin | [http://localhost:5050](http://localhost:5050) | Quản lý PostgreSQL |

> **pgAdmin credentials:** `admin@thientn.nopiko` / `123456`

### 4️⃣ Dọn dẹp

```bash
# Dừng và xóa containers
docker compose -f docker-compose.full.yaml down

# Xóa cả volumes (dữ liệu)
docker compose -f docker-compose.full.yaml down -v

# Xóa toàn bộ images + containers không dùng
docker system prune -af
```

---

## 📖 Các khái niệm Docker được đề cập

<details>
<summary><strong>🐳 Dockerfile Instructions</strong></summary>

| Instruction | Mô tả | Ví dụ |
|-------------|--------|-------|
| `FROM` | Base image | `FROM node:24-alpine` |
| `WORKDIR` | Thư mục làm việc | `WORKDIR /app` |
| `COPY` | Copy files vào image | `COPY package.json .` |
| `RUN` | Chạy lệnh build-time | `RUN npm ci` |
| `ENV` | Đặt biến môi trường | `ENV NODE_ENV=production` |
| `ARG` | Build argument | `ARG VITE_API_URL=""` |
| `EXPOSE` | Khai báo port | `EXPOSE 3000` |
| `CMD` | Lệnh khởi động | `CMD ["node", "dist/main.js"]` |
| `USER` | Chạy dưới user không phải root | `USER appuser` |

</details>

<details>
<summary><strong>🏗️ Multi-stage Build</strong></summary>

- Sử dụng nhiều `FROM` trong cùng một Dockerfile
- Stage đầu (builder) biên dịch mã nguồn
- Stage cuối (runner) chỉ chứa artifact cần thiết
- Giảm kích thước image đáng kể (250MB → 15MB)

</details>

<details>
<summary><strong>📦 Volumes & Bind Mounts</strong></summary>

- **Named Volumes:** `docker volume create <name>` — quản lý bởi Docker, persist data
- **Bind Mounts:** `-v /host/path:/container/path` — map trực tiếp từ host
- Named Volumes phù hợp cho production, Bind Mounts phù hợp cho development

</details>

<details>
<summary><strong>🌐 Docker Networking</strong></summary>

- Docker Compose tạo network mặc định cho tất cả services
- Containers giao tiếp qua tên service (DNS resolution)
- Ví dụ: Backend kết nối DB qua `DB_HOST=database`
- Nginx proxy sang backend qua `proxy_pass http://backend:3000`

</details>

<details>
<summary><strong>🎼 Docker Compose</strong></summary>

- Quản lý multi-container applications
- `depends_on` + `condition: service_healthy` — kiểm soát thứ tự khởi động
- `volumes` — persist data
- `environment` — truyền biến môi trường
- `restart: unless-stopped` — tự restart khi crash

</details>

<details>
<summary><strong>❤️‍🩹 Health Checks</strong></summary>

- `test` — lệnh kiểm tra sức khỏe container
- `interval` — tần suất kiểm tra
- `timeout` — thời gian chờ tối đa
- `retries` — số lần thử lại
- `start_period` — thời gian chờ ban đầu

</details>

---

## 🤝 Đóng góp

Đóng góp luôn được hoan nghênh! Hãy:

1. **Fork** repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mô tả thay đổi"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo **Pull Request**

---

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép **UNLICENSED** — sử dụng cho mục đích học tập.

---

<p align="center">
  <strong>Made with ❤️ for learning Docker</strong><br/>
  <sub>⭐ Nếu repo hữu ích, hãy cho mình một star nhé!</sub>
</p>
