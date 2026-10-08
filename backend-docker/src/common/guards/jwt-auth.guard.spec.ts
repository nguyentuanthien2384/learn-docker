import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Controller, Get, Injectable, UseGuards, type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { ExtractJwt, Strategy } from 'passport-jwt';
import request from 'supertest';
import { JwtAuthGuard } from '#src/common/guards/jwt-auth.guard.js';
import { Public } from '#src/common/decorators/public.decorator.js';
import { CurrentUser, type RequestUser } from '#src/common/decorators/current-user.decorator.js';

const SECRET = 'test-secret';

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: SECRET });
  }
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}

@Controller('guarded')
@UseGuards(JwtAuthGuard)
class GuardedController {
  @Public()
  @Get('public')
  publicRoute(@CurrentUser() user?: RequestUser) {
    return { userId: user?.id ?? null };
  }

  @Get('private')
  privateRoute(@CurrentUser() user: RequestUser) {
    return { userId: user.id };
  }
}

// Controller không gắn guard (giống TodosController): không được bị ảnh hưởng
@Controller('open')
class OpenController {
  @Get()
  open() {
    return { ok: true };
  }
}

describe('JwtAuthGuard', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: SECRET })],
      controllers: [GuardedController, OpenController],
      providers: [TestJwtStrategy],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    token = moduleRef.get(JwtService).sign({ sub: 'user-1', email: 'a@b.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('route @Public cho khách đi qua với user = null', async () => {
    const res = await request(app.getHttpServer()).get('/guarded/public').expect(200);
    expect(res.body.userId).toBeNull();
  });

  it('route @Public vẫn nhận user khi có token hợp lệ', async () => {
    const res = await request(app.getHttpServer())
      .get('/guarded/public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.userId).toBe('user-1');
  });

  it('route @Public bỏ qua token sai thay vì trả 401', async () => {
    await request(app.getHttpServer())
      .get('/guarded/public')
      .set('Authorization', 'Bearer bad.token.value')
      .expect(200);
  });

  it('route thường trả 401 khi không có token', async () => {
    await request(app.getHttpServer()).get('/guarded/private').expect(401);
  });

  it('route thường cho qua khi có token hợp lệ', async () => {
    const res = await request(app.getHttpServer())
      .get('/guarded/private')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.userId).toBe('user-1');
  });

  it('controller không gắn guard không bị ảnh hưởng', async () => {
    await request(app.getHttpServer()).get('/open').expect(200);
  });
});

