import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import {
  Snippet,
  SnippetLine,
  SnippetStar,
  SnippetTag,
  Tag,
  User,
} from '#src/database/entities/index.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(SnippetTag)
    private readonly snippetTagRepo: Repository<SnippetTag>,
    @InjectRepository(SnippetLine)
    private readonly lineRepo: Repository<SnippetLine>,
    @InjectRepository(SnippetStar)
    private readonly starRepo: Repository<SnippetStar>,
  ) {}

  /**
   * Lifecycle hook của NestJS: Chạy tự động mỗi khi ứng dụng khởi động
   * sau khi toàn bộ modules và kết nối database đã sẵn sàng.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.seedData();
  }

  /**
   * Function chính kiểm tra từng model:
   * - Nếu model đã có dữ liệu (count > 0): bỏ qua việc seed.
   * - Nếu model chưa có record: tạo fake data mẫu cho model đó.
   */
  async seedData(): Promise<void> {
    try {
      this.logger.log('--- [NestJS Lifecycle] Bắt đầu kiểm tra và seed dữ liệu ---');

      // 1. Kiểm tra & seed model User
      await this.checkAndSeedUsers();

      // 2. Kiểm tra & seed model Tag
      await this.checkAndSeedTags();

      // 3. Kiểm tra & seed model Snippet (bao gồm SnippetLine, SnippetTag)
      await this.checkAndSeedSnippets();

      // 4. Kiểm tra & seed model SnippetStar
      await this.checkAndSeedStars();

      this.logger.log('--- [NestJS Lifecycle] Hoàn tất chu trình kiểm tra seed dữ liệu ---');
    } catch (err) {
      this.logger.warn(`Lỗi trong quá trình kiểm tra/seed data: ${(err as Error).message}`);
    }
  }

  /**
   * 1. Kiểm tra và tạo fake data cho User
   */
  private async checkAndSeedUsers(): Promise<void> {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log(`[Seed] Model 'User' đã có dữ liệu (${userCount} records). Bỏ qua seed.`);
      return;
    }

    this.logger.log(`[Seed] Model 'User' chưa có dữ liệu (count = 0). Tiến hành tạo fake users...`);
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('123456', salt);

    const fakeUsers = [
      {
        email: 'hoidanit@example.com',
        passwordHash: defaultPasswordHash,
        name: 'Hỏi Dân IT',
        bio: 'Kênh chia sẻ kiến thức lập trình, Docker, DevOps thực chiến.',
      },
      {
        email: 'thu.nguyen@example.com',
        passwordHash: defaultPasswordHash,
        name: 'Thu Nguyen',
        bio: 'Python & DevOps enthusiast.',
      },
      {
        email: 'dev.master@example.com',
        passwordHash: defaultPasswordHash,
        name: 'Dev Master',
        bio: 'Senior Cloud & Backend Architect.',
      },
    ];

    for (const item of fakeUsers) {
      const user = this.userRepo.create(item);
      await this.userRepo.save(user);
    }
    this.logger.log(`[Seed] Đã tạo thành công ${fakeUsers.length} tài khoản người dùng mẫu (mật khẩu: 123456).`);
  }

  /**
   * 2. Kiểm tra và tạo fake data cho Tag
   */
  private async checkAndSeedTags(): Promise<void> {
    const tagCount = await this.tagRepo.count();
    if (tagCount > 0) {
      this.logger.log(`[Seed] Model 'Tag' đã có dữ liệu (${tagCount} records). Bỏ qua seed.`);
      return;
    }

    this.logger.log(`[Seed] Model 'Tag' chưa có dữ liệu (count = 0). Tiến hành tạo tags mẫu...`);
    const defaultTags = [
      'dockerfile',
      'docker-compose',
      'nestjs',
      'multi-stage',
      'python',
      'fastapi',
      'postgres',
      'redis',
      'cli',
      'cleanup',
      'ai-prompt',
      'security',
    ];

    // Lấy user đầu tiên làm creator nếu có
    const author = await this.userRepo.findOne({ where: {} });
    const authorId = author ? author.id : null;

    for (const tagName of defaultTags) {
      const tag = this.tagRepo.create({
        name: tagName,
        createdBy: authorId,
        usageCount: 0,
      });
      await this.tagRepo.save(tag);
    }
    this.logger.log(`[Seed] Đã tạo ${defaultTags.length} thẻ tags mẫu.`);
  }

  /**
   * 3. Kiểm tra và tạo fake data cho Snippet, SnippetLine, SnippetTag
   */
  private async checkAndSeedSnippets(): Promise<void> {
    const snippetCount = await this.snippetRepo.count();
    if (snippetCount > 0) {
      this.logger.log(`[Seed] Model 'Snippet' đã có dữ liệu (${snippetCount} records). Bỏ qua seed.`);
      return;
    }

    this.logger.log(`[Seed] Model 'Snippet' chưa có dữ liệu (count = 0). Tiến hành nạp snippets mẫu...`);

    // Lấy danh sách tác giả
    const userHoiDanIT = await this.userRepo.findOne({ where: { email: 'hoidanit@example.com' } });
    const userThuNguyen = await this.userRepo.findOne({ where: { email: 'thu.nguyen@example.com' } });

    if (!userHoiDanIT) {
      this.logger.warn('[Seed] Chưa tìm thấy tác giả để gắn snippet. Bỏ qua nạp snippet.');
      return;
    }

    const seedItems = [
      {
        author: userHoiDanIT,
        type: 'docker_code' as const,
        filename: 'Dockerfile',
        starsCount: 342,
        isPublic: true,
        title: 'Dockerfile multi-stage cho NestJS',
        description: 'Build 2 tầng, image cuối chỉ ~120MB, không mang theo devDependencies.',
        tags: ['dockerfile', 'nestjs', 'multi-stage'],
        lines: [
          { code: 'FROM node:20-alpine AS builder', explanation: 'Tầng build. Dùng alpine cho nhẹ, đặt tên builder để tầng sau copy lại artifact.' },
          { code: 'WORKDIR /app', explanation: 'Mọi lệnh sau đều chạy trong /app. Tránh viết đường dẫn tuyệt đối lặp lại.' },
          { code: 'COPY package*.json ./', explanation: 'Copy riêng package.json trước để Docker cache lớp install. Code đổi không làm mất cache node_modules.' },
          { code: 'RUN npm ci', explanation: 'npm ci đọc package-lock.json, cài đúng version đã khóa. Nhanh và tái lập được, khác npm install.' },
          { code: 'COPY . .', explanation: 'Giờ mới copy source. Nhớ có .dockerignore để không copy node_modules và .git vào image.' },
          { code: 'RUN npm run build', explanation: 'Biên dịch TypeScript ra dist/. Đây là thứ duy nhất tầng runtime cần.' },
          { code: '', explanation: 'Dòng trống phân tách hai tầng, chỉ để dễ đọc.' },
          { code: 'FROM node:20-alpine', explanation: 'Bắt đầu tầng runtime từ image sạch. Toàn bộ cache build ở trên bị bỏ lại.' },
          { code: 'WORKDIR /app', explanation: 'Thư mục làm việc của tầng runtime, độc lập với tầng builder.' },
          { code: 'COPY package*.json ./', explanation: 'Cần manifest để cài dependencies production.' },
          { code: 'RUN npm ci --omit=dev', explanation: 'Chỉ cài dependencies runtime. Đây là chỗ tiết kiệm dung lượng nhiều nhất.' },
          { code: 'COPY --from=builder /app/dist ./dist', explanation: 'Lấy dist/ từ tầng builder. Source .ts và toolchain không bao giờ vào image cuối.' },
          { code: 'USER node', explanation: 'Hạ quyền, không chạy app bằng root. Bước bảo mật rẻ nhất mà hay bị bỏ qua.' },
          { code: 'EXPOSE 3000', explanation: 'Khai báo tài liệu về cổng. Vẫn phải -p khi docker run mới publish thật.' },
          { code: 'CMD ["node", "dist/main.js"]', explanation: 'Dạng exec, node là PID 1 nên nhận được SIGTERM và shutdown gọn.' },
        ],
      },
      {
        author: userHoiDanIT,
        type: 'docker_code' as const,
        filename: 'docker-compose.yml',
        starsCount: 288,
        isPublic: true,
        title: 'Compose: NestJS + Postgres + Redis',
        description: 'Stack dev đầy đủ với healthcheck và depends_on điều kiện.',
        tags: ['docker-compose', 'postgres', 'redis'],
        lines: [
          { code: 'services:', explanation: 'Gốc của mọi compose file. Mỗi khóa con là một container.' },
          { code: '  api:', explanation: 'Service API. Tên này cũng là hostname trong mạng nội bộ của compose.' },
          { code: '    build: .', explanation: 'Build từ Dockerfile trong thư mục hiện tại thay vì pull image có sẵn.' },
          { code: '    ports: ["3000:3000"]', explanation: 'Map cổng host:container. Chỉ service nào cần truy cập từ ngoài mới mở.' },
          { code: '    environment:', explanation: 'Biến môi trường truyền vào container lúc chạy.' },
          { code: '      DB_HOST: db', explanation: 'Dùng tên service làm host. Compose có DNS nội bộ, không cần IP.' },
          { code: '    depends_on:', explanation: 'Thứ tự khởi động. Mặc định chỉ chờ container start, không chờ app bên trong sẵn sàng.' },
          { code: '      db: { condition: service_healthy }', explanation: 'Chờ healthcheck của db pass mới start api. Đây là cách sửa lỗi kết nối lúc boot.' },
          { code: '  db:', explanation: 'Service Postgres.' },
          { code: '    image: postgres:16-alpine', explanation: 'Pin minor version. Đừng dùng latest cho database.' },
          { code: '    healthcheck:', explanation: 'Định nghĩa cách Docker biết service đã sẵn sàng.' },
          { code: '      test: ["CMD-SHELL", "pg_isready -U app"]', explanation: 'pg_isready trả về 0 khi Postgres nhận kết nối. Nhẹ hơn nhiều so với chạy query.' },
          { code: '    volumes: ["pgdata:/var/lib/postgresql/data"]', explanation: 'Named volume giữ dữ liệu sau khi down. Không có dòng này là mất DB mỗi lần recreate.' },
          { code: 'volumes:', explanation: 'Khai báo named volume ở cấp cao nhất để service tham chiếu được.' },
          { code: '  pgdata:', explanation: 'Volume rỗng, Docker tự quản lý vị trí lưu trên host.' },
        ],
      },
      {
        author: userHoiDanIT,
        type: 'docker_code' as const,
        filename: 'cleanup.sh',
        starsCount: 511,
        isPublic: true,
        title: 'Dọn ổ cứng khi Docker ăn hết disk',
        description: 'Bốn lệnh theo thứ tự an toàn, từ nhẹ tới xóa sạch.',
        tags: ['cli', 'cleanup', 'volume'],
        lines: [
          { code: 'docker system df', explanation: 'Luôn chạy lệnh này trước. Nó cho biết dung lượng nằm ở image, container, volume hay build cache.' },
          { code: 'docker container prune -f', explanation: 'Xóa container đã stop. An toàn nhất, không ảnh hưởng dữ liệu.' },
          { code: 'docker image prune -a -f', explanation: 'Xóa mọi image không có container nào dùng. Lần build sau sẽ lâu hơn.' },
          { code: 'docker builder prune -f', explanation: 'Xóa build cache của BuildKit. Thường đây là thủ phạm chiếm chục GB.' },
          { code: 'docker volume ls -qf dangling=true', explanation: 'Liệt kê volume không còn container nào gắn. Đọc kỹ trước khi xóa, DB của bạn có thể nằm ở đây.' },
          { code: 'docker volume prune -f', explanation: 'Xóa các volume vừa liệt kê. Không undo được.' },
        ],
      },
      {
        author: userThuNguyen || userHoiDanIT,
        type: 'docker_code' as const,
        filename: 'Dockerfile',
        starsCount: 176,
        isPublic: true,
        title: 'FastAPI slim + uvicorn workers',
        description: 'Base python slim, cache pip đúng cách, chạy uvicorn nhiều worker.',
        tags: ['dockerfile', 'python', 'fastapi'],
        lines: [
          { code: 'FROM python:3.12-slim', explanation: 'slim nhỏ hơn image full nhiều, vẫn có glibc nên wheel nhị phân chạy được (khác alpine).' },
          { code: 'ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1', explanation: 'Bỏ file .pyc và tắt buffer stdout để log hiện ngay trong docker logs.' },
          { code: 'WORKDIR /app', explanation: 'Thư mục làm việc.' },
          { code: 'COPY requirements.txt .', explanation: 'Copy riêng để tách lớp cache cài đặt.' },
          { code: 'RUN pip install --no-cache-dir -r requirements.txt', explanation: '--no-cache-dir bỏ cache pip, giảm vài trăm MB trong layer.' },
          { code: 'COPY ./app ./app', explanation: 'Chỉ copy package ứng dụng, không copy cả repo.' },
          { code: 'CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--workers", "4"]', explanation: '0.0.0.0 là bắt buộc, bind 127.0.0.1 thì ngoài container không vào được.' },
        ],
      },
      {
        author: userHoiDanIT,
        type: 'ai_prompt' as const,
        filename: null,
        starsCount: 623,
        isPublic: true,
        title: 'Viết Dockerfile multi-stage tối ưu dung lượng',
        description: 'Prompt khung cho mọi tech stack, có ràng buộc rõ nên AI không bịa.',
        tags: ['ai-prompt', 'dockerfile', 'multi-stage'],
        content: 'Bạn là DevOps engineer 10 năm kinh nghiệm.\n\nViết Dockerfile multi-stage cho dự án {{tech_stack}} chạy trên {{base_image}}.\n\nYêu cầu:\n- Tối thiểu dung lượng image cuối, không mang devDependencies\n- Tận dụng layer cache: copy manifest và cài dependencies trước khi copy source\n- Chạy bằng user không phải root\n- Dùng exec form cho CMD để nhận SIGTERM\n\nGiải thích ngắn từng dòng bằng comment. Không thêm tool ngoài yêu cầu.',
        variables: {
          tech_stack: { placeholder: 'NestJS + Prisma', rows: 1 },
          base_image: { placeholder: 'node:20-alpine', rows: 1 },
        },
        lines: [],
      },
      {
        author: userHoiDanIT,
        type: 'ai_prompt' as const,
        filename: null,
        starsCount: 498,
        isPublic: true,
        title: 'Debug lỗi network giữa hai container',
        description: 'Dán log và compose vào, AI chẩn đoán theo thứ tự thay vì đoán bừa.',
        tags: ['ai-prompt', 'debugging', 'docker-compose'],
        content: 'Tôi gặp lỗi kết nối giữa các container trong Docker Compose.\n\nThông báo lỗi:\n{{error_message}}\n\nFile compose của tôi:\n{{compose_file}}\n\nHãy chẩn đoán theo thứ tự: DNS service name, thứ tự khởi động và healthcheck, host bind trong app, network cùng bridge hay không, cuối cùng mới tới firewall.\n\nVới mỗi giả thuyết, cho tôi một lệnh để kiểm chứng. Chỉ đưa kết luận sau khi đã loại trừ.',
        variables: {
          error_message: { placeholder: 'ECONNREFUSED 172.18.0.3:5432', rows: 2 },
          compose_file: { placeholder: 'Dán nội dung docker-compose.yml', rows: 4 },
        },
        lines: [],
      },
      {
        author: userThuNguyen || userHoiDanIT,
        type: 'ai_prompt' as const,
        filename: null,
        starsCount: 254,
        isPublic: true,
        title: 'Review bảo mật một Dockerfile',
        description: 'Bắt AI xếp hạng rủi ro và trả về diff, không giảng lý thuyết.',
        tags: ['ai-prompt', 'security', 'review'],
        content: 'Review bảo mật Dockerfile sau, mức độ khắt khe: {{strictness}}.\n\n{{dockerfile}}\n\nTrả về bảng: vấn đề, mức rủi ro (cao/trung/thấp), dòng bị ảnh hưởng, cách sửa.\n\nSau bảng, đưa Dockerfile đã sửa dưới dạng diff. Không giải thích lý thuyết chung.',
        variables: {
          strictness: { placeholder: 'production, chuẩn CIS', rows: 1 },
          dockerfile: { placeholder: 'Dán Dockerfile của bạn', rows: 4 },
        },
        lines: [],
      },
    ];

    for (const item of seedItems) {
      const snippet = this.snippetRepo.create({
        authorId: item.author.id,
        type: item.type,
        title: item.title,
        description: item.description,
        isPublic: item.isPublic,
        filename: item.filename,
        content: (item as any).content ?? null,
        variables: (item as any).variables ?? {},
        starsCount: item.starsCount,
      });
      const saved = await this.snippetRepo.save(snippet);

      // Nạp các dòng code snippet line
      if (item.lines && item.lines.length > 0) {
        const lines = item.lines.map((l, idx) =>
          this.lineRepo.create({
            snippetId: saved.id,
            position: idx,
            code: l.code,
            explanation: l.explanation,
          }),
        );
        await this.lineRepo.save(lines);
      }

      // Nạp snippet tags và cập nhật usageCount cho tag
      for (const tagName of item.tags) {
        let tag = await this.tagRepo.findOne({ where: { name: tagName } });
        if (!tag) {
          tag = this.tagRepo.create({
            name: tagName,
            createdBy: item.author.id,
            usageCount: 0,
          });
          await this.tagRepo.save(tag);
        }

        const st = this.snippetTagRepo.create({
          snippetId: saved.id,
          tagId: tag.id,
        });
        await this.snippetTagRepo.save(st);
        await this.tagRepo.increment({ id: tag.id }, 'usageCount', 1);
      }
    }

    this.logger.log(`[Seed] Đã nạp thành công ${seedItems.length} snippets mẫu.`);
  }

  /**
   * 4. Kiểm tra và tạo fake data cho SnippetStar
   */
  private async checkAndSeedStars(): Promise<void> {
    const starCount = await this.starRepo.count();
    if (starCount > 0) {
      this.logger.log(`[Seed] Model 'SnippetStar' đã có dữ liệu (${starCount} records). Bỏ qua seed.`);
      return;
    }

    this.logger.log(`[Seed] Model 'SnippetStar' chưa có dữ liệu (count = 0). Tiến hành tạo stars mẫu...`);
    const users = await this.userRepo.find({ take: 5 });
    const snippets = await this.snippetRepo.find({ where: { isPublic: true }, take: 10 });

    if (users.length < 2 || snippets.length === 0) {
      this.logger.log('[Seed] Chưa đủ user hoặc snippet để tạo stars mẫu. Bỏ qua.');
      return;
    }

    let createdStars = 0;
    for (const snippet of snippets) {
      for (const user of users) {
        // Tránh tự star snippet của chính mình theo luật nghiệp vụ
        if (user.id !== snippet.authorId) {
          const star = this.starRepo.create({
            userId: user.id,
            snippetId: snippet.id,
          });
          await this.starRepo.save(star);
          createdStars++;
        }
      }
      // Đồng bộ stars_count thực tế
      const actualStars = await this.starRepo.count({ where: { snippetId: snippet.id } });
      await this.snippetRepo.update(snippet.id, { starsCount: actualStars });
    }

    this.logger.log(`[Seed] Đã tạo thành công ${createdStars} stars mẫu cho các snippets.`);
  }
}
