import { INestApplication } from '@nestjs/common';
import { createTestApp, registerAndLogin, req } from './setup';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app);
    token = auth.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/categories', () => {
    it('should create an expense category', async () => {
      const res = await req(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Food', type: 'expense' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('should create an income category', async () => {
      const res = await req(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Salary', type: 'income' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('should return 400 for invalid category type', async () => {
      await req(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bad', type: 'invalid' })
        .expect(400);
    });

    it('should return 400 for missing name', async () => {
      await req(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'expense' })
        .expect(400);
    });
  });

  describe('GET /api/categories', () => {
    it('should list all categories for the user', async () => {
      const res = await req(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const names = res.body.map((c: any) => c.name);
      expect(names).toContain('Food');
      expect(names).toContain('Salary');
    });

    it('should not return categories from other users', async () => {
      const otherAuth = await registerAndLogin(app, {
        name: 'Other User',
        email: 'other-cat@example.com',
        password: 'password123',
      });

      const res = await req(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${otherAuth.token}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });
});
