import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hsi.local',
          password: 'admin123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@hsi.local');
    });

    it('should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hsi.local',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);
    });

    it('should reject login with inactive user', async () => {
      // Criar ou atualizar usuário inativo para teste
      const inactiveUser = await prisma.user.upsert({
        where: { email: 'inactive@test.com' },
        update: { active: false },
        create: {
          email: 'inactive@test.com',
          name: 'Inactive User',
          password: '$2a$10$hashedPassword',
          role: 'LEITOR',
          active: false,
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'password',
        })
        .expect(401);

      // Cleanup - manter inativo para próximos testes
      await prisma.user.update({ 
        where: { id: inactiveUser.id },
        data: { active: false }
      });
    });

    it('should reject login with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hsi.local',
        })
        .expect(401); // Missing password

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          password: 'admin123',
        })
        .expect(401); // Missing email
    });
  });

  describe('JWT Token Validation', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hsi.local',
          password: 'admin123',
        });

      token = response.body.access_token;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
