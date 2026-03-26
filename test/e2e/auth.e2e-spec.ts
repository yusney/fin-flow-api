import { INestApplication } from '@nestjs/common';
import { createTestApp, req } from './setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return { id }', async () => {
      const res = await req(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'secret123' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('should return 409 for duplicate email', async () => {
      await req(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'duplicate@example.com', password: 'secret123' })
        .expect(201);

      await req(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Copy', email: 'duplicate@example.com', password: 'secret456' })
        .expect(409);
    });

    it('should return 400 for invalid data (missing fields)', async () => {
      await req(app)
        .post('/api/auth/register')
        .send({ email: 'bad@example.com' })
        .expect(400);
    });

    it('should return 400 for password too short', async () => {
      await req(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'short@example.com', password: '12345' })
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      await req(app)
        .post('/api/auth/register')
        .send({ name: 'Bad Email', email: 'not-an-email', password: 'secret123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await req(app)
        .post('/api/auth/register')
        .send({ name: 'Login User', email: 'login@example.com', password: 'mypassword' });
    });

    it('should login with valid credentials and return { access_token }', async () => {
      const res = await req(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'mypassword' })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should return 400 for wrong password', async () => {
      await req(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      await req(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever' })
        .expect(404);
    });
  });

  describe('Protected routes without token', () => {
    it('should return 401 for GET /api/categories without token', async () => {
      await req(app)
        .get('/api/categories')
        .expect(401);
    });

    it('should return 401 for GET /api/transactions without token', async () => {
      await req(app)
        .get('/api/transactions')
        .expect(401);
    });
  });
});
