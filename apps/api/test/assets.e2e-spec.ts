import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Assets E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testAssetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hsi.local',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup: remover asset de teste se foi criado
    if (testAssetId) {
      try {
        await prisma.asset.delete({ where: { id: testAssetId } });
      } catch (error) {
        // Asset já foi deletado
      }
    }
    await app.close();
  });

  describe('/assets (GET)', () => {
    it('should return paginated assets', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('skip');
      expect(response.body).toHaveProperty('take');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter assets by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets?status=EM_ESTOQUE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.every((asset: any) => asset.status === 'EM_ESTOQUE')).toBe(true);
    });

    it('should search assets by term', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets?search=HSI')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets?skip=0&take=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.take).toBe(10);
      expect(response.body.items.length).toBeLessThanOrEqual(10);
    });
  });

  describe('/assets (POST)', () => {
    it('should create a new asset', async () => {
      // Buscar categoria e localização existentes
      const category = await prisma.category.findFirst();
      const location = await prisma.location.findFirst();
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

      const newAsset = {
        name: 'Test Asset E2E',
        assetTag: `TEST-${Date.now()}`,
        categoryId: category!.id,
        locationId: location!.id,
        status: 'EM_ESTOQUE',
        createdById: admin!.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newAsset)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newAsset.name);
      expect(response.body.assetTag).toBe(newAsset.assetTag);

      testAssetId = response.body.id;
    });

    it('should reject asset creation without required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Asset',
        })
        .expect(400);
    });
  });

  describe('/assets/:id (GET)', () => {
    it('should get asset by id', async () => {
      if (!testAssetId) {
        // Criar um asset se ainda não existe
        const category = await prisma.category.findFirst();
        const location = await prisma.location.findFirst();
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        const asset = await prisma.asset.create({
          data: {
            name: 'Test Asset',
            assetTag: `TEST-${Date.now()}`,
            categoryId: category!.id,
            locationId: location!.id,
            status: 'EM_ESTOQUE',
            createdById: admin!.id,
          },
        });
        testAssetId = asset.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testAssetId);
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/assets/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/assets/:id (PATCH)', () => {
    it('should update asset', async () => {
      if (!testAssetId) return;

      const updateData = {
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
    });
  });

  describe('/assets/:id (DELETE)', () => {
    it('should delete asset', async () => {
      if (!testAssetId) return;

      await request(app.getHttpServer())
        .delete(`/api/v1/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verificar que foi deletado
      await request(app.getHttpServer())
        .get(`/api/v1/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      testAssetId = ''; // Limpar ID para não tentar deletar no afterAll
    });
  });

  describe('/assets/stats/dashboard (GET)', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets/stats/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalAssets');
      expect(response.body).toHaveProperty('assetsByStatus');
      expect(typeof response.body.totalAssets).toBe('number');
    });
  });
});
