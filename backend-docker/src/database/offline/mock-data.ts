export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'hoidanit@example.com',
  name: 'Hỏi Dân IT (Offline Mode)',
  bio: 'Tài khoản giả lập khi DB_ENABLED=false',
  avatarUrl: null,
};

export const MOCK_ACCESS_TOKEN = 'mock_jwt_token_offline_mode';

// Dữ liệu mẫu dùng khi DB_ENABLED=false để phục vụ kiểm thử API mà không cần database
export const MOCK_SNIPPETS = [
  {
    id: '1',
    type: 'docker_code',
    filename: 'Dockerfile',
    title: 'Dockerfile multi-stage cho NestJS (Offline Mock)',
    description: 'Build 2 tầng, image cuối chỉ ~120MB, không mang theo devDependencies.',
    isPublic: true,
    starsCount: 342,
    hasStarred: false,
    tags: ['dockerfile', 'nestjs', 'multi-stage'],
    lines: [
      { code: 'FROM node:20-alpine AS builder', explanation: 'Tầng build.' },
      { code: 'WORKDIR /app', explanation: 'Thư mục làm việc trong container.' },
      { code: 'COPY package*.json ./', explanation: 'Copy package manifest.' },
      { code: 'RUN npm ci', explanation: 'Cài dependencies sạch.' },
      { code: 'COPY . .', explanation: 'Copy toàn bộ source code.' },
      { code: 'RUN npm run build', explanation: 'Build TypeScript ra dist/.' },
      { code: 'FROM node:20-alpine', explanation: 'Tầng runtime nhẹ.' },
      { code: 'WORKDIR /app', explanation: 'Thư mục làm việc tầng runtime.' },
      { code: 'COPY --from=builder /app/dist ./dist', explanation: 'Lấy dist từ builder.' },
      { code: 'CMD ["node", "dist/main.js"]', explanation: 'Khởi chạy ứng dụng.' },
    ],
    author: {
      id: 'mock-user-1',
      name: 'Hỏi Dân IT',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'ai_prompt',
    filename: null,
    title: 'Viết Dockerfile multi-stage tối ưu dung lượng (Offline Mock)',
    description: 'Prompt khung cho mọi tech stack, có ràng buộc rõ.',
    isPublic: true,
    starsCount: 623,
    hasStarred: false,
    tags: ['ai-prompt', 'dockerfile', 'multi-stage'],
    content:
      'Bạn là DevOps engineer 10 năm kinh nghiệm.\n\nViết Dockerfile multi-stage cho dự án {{tech_stack}} chạy trên {{base_image}}.',
    variables: {
      tech_stack: { placeholder: 'NestJS + Prisma', rows: 1 },
      base_image: { placeholder: 'node:20-alpine', rows: 1 },
    },
    author: {
      id: 'mock-user-1',
      name: 'Hỏi Dân IT',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_TAGS = [
  { id: '1', name: 'dockerfile', usageCount: 42 },
  { id: '2', name: 'nestjs', usageCount: 38 },
  { id: '3', name: 'docker-compose', usageCount: 29 },
  { id: '4', name: 'ai-prompt', usageCount: 25 },
  { id: '5', name: 'multi-stage', usageCount: 19 },
];
