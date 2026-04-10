import { INestApplication } from '@nestjs/common';
import { createTestApp, registerAndLogin, req } from './setup';

describe('Subscriptions (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app);
    token = auth.token;

    const catRes = await req(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Entertainment', type: 'expense' })
      .expect(201);

    categoryId = catRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/subscriptions', () => {
    it('T18: should create subscription with all new fields', async () => {
      const res = await req(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 14.99,
          description: 'Netflix Premium',
          billingDay: 15,
          categoryId,
          startDate: '2026-01-15',
          frequency: 'ANNUAL',
          type: 'DIGITAL_SERVICE',
          serviceUrl: 'https://netflix.com',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('T19: should create subscription with minimal fields and apply defaults', async () => {
      const res = await req(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 9.99,
          description: 'Gym membership',
          billingDay: 1,
          categoryId,
          startDate: '2026-01-01',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');

      const listRes = await req(app)
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const gym = listRes.body.find(
        (s: any) => s.description === 'Gym membership',
      );
      expect(gym).toBeDefined();
      expect(gym.frequency).toBe('MONTHLY');
      expect(gym.type).toBe('GENERAL');
    });

    it('T20: should return 400 for DIGITAL_SERVICE without serviceUrl', async () => {
      await req(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 9.99,
          description: 'Spotify',
          billingDay: 1,
          categoryId,
          startDate: '2026-01-01',
          type: 'DIGITAL_SERVICE',
        })
        .expect(400);
    });

    it('T22: should fail when endDate is before startDate', async () => {
      await req(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 9.99,
          description: 'Short Sub',
          billingDay: 1,
          categoryId,
          startDate: '2026-06-01',
          endDate: '2026-01-01',
        })
        .expect(400);
    });
  });

  describe('GET /api/subscriptions', () => {
    it('T21: should list subscriptions with all new fields', async () => {
      const res = await req(app)
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const netflix = res.body.find(
        (s: any) => s.description === 'Netflix Premium',
      );
      expect(netflix).toBeDefined();
      expect(netflix.startDate).toBeDefined();
      expect(netflix.frequency).toBe('ANNUAL');
      expect(netflix.type).toBe('DIGITAL_SERVICE');
      expect(netflix.serviceUrl).toBe('https://netflix.com');
    });
  });
});
