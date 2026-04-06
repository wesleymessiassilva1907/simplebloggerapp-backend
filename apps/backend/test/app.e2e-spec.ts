import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Vertix API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/health should return ok', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.services).toBeDefined();
        });
    });
  });

  describe('Auth', () => {
    it('POST /api/auth/login should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /api/auth/login should reject empty body', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /api/auth/register-initial-tenant-admin should validate input', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register-initial-tenant-admin')
        .send({ tenantName: '', tenantSlug: '', name: '', email: 'invalid', password: '12' })
        .expect(400);
    });

    it('POST /api/auth/forgot-password should accept any email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });

    it('POST /api/auth/reset-password should reject invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'NewPass@123' })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('GET /api/auth/me should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('GET /api/users should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });

    it('GET /api/tenants should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/tenants')
        .expect(401);
    });

    it('GET /api/clinic/patients should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/clinic/patients')
        .expect(401);
    });

    it('GET /api/construction/projects should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/construction/projects')
        .expect(401);
    });
  });

  describe('Swagger', () => {
    it('GET /api/docs should return swagger page', () => {
      return request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);
    });
  });
});
