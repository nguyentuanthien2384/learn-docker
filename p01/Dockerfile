FROM node:24-alpine
WORKDIR /nopiko-p01
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/server.js"]


# chạy
# Cú pháp:
# docker build -t p01-nopiko:1.0 .

# docker build  Lệnh dùng để khởi tạo quá trình build image từ Dockerfile.
# -t ten-image:tag   Đặt tên (repository) và gắn thẻ (tag, ví dụ như latest hoặc v1.0) cho image để dễ quản lý. Nếu bạn bỏ qua phần :tag, Docker sẽ tự động gán nhãn là latest
# .  Dấu chấm ở cuối biểu thị thư mục hiện tại làm ngữ cảnh build (build context), nơi Docker sẽ tìm file Dockerfile và các tệp liên quan.

# docker images
# docker run -d -p 3000:3000 --name express-nopiko p01-nopiko:1.0
# id: 539ef52f027d924dc7dac96e80b7f51b3f6a815ac52932d9d93d5f7c6a9d7f7d
