import { INestApplication } from '@nestjs/common';
import { createTestApp, registerAndLogin, req } from './setup';

describe('Subscription Templates (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let otherToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app);
    token = auth.token;

    const otherAuth = await registerAndLogin(app, {
      name: 'Other User',
      email: 'other-templates@example.com',
      password: 'password123',
    });
    otherToken = otherAuth.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/subscription-templates
  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /api/subscription-templates', () => {
    it('ST01: should return global templates for authenticated user', async () => {
      const res = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const netflix = res.body.find((t: any) => t.name === 'Netflix');
      expect(netflix).toBeDefined();
      expect(netflix.ownership).toBe('GLOBAL');
      expect(netflix.templateCategory).toBe('STREAMING');
    });

    it('ST02: should filter templates by category', async () => {
      const res = await req(app)
        .get('/api/subscription-templates?category=MUSIC')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach((t: any) => {
        expect(t.templateCategory).toBe('MUSIC');
      });
    });

    it('ST03: should include user-created templates alongside global ones', async () => {
      // Create a user template first
      await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Custom Service',
          templateCategory: 'OTHER',
          defaultFrequency: 'MONTHLY',
          defaultAmount: 9.99,
          serviceUrl: 'https://example.com',
        })
        .expect(201);

      const res = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const custom = res.body.find((t: any) => t.name === 'My Custom Service');
      expect(custom).toBeDefined();
      expect(custom.ownership).toBe('USER');
    });

    it("ST04: should not return another user's private templates", async () => {
      const res = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      const hasCustom = res.body.some(
        (t: any) => t.name === 'My Custom Service' && t.ownership === 'USER',
      );
      expect(hasCustom).toBe(false);
    });

    it('ST05: should return 401 without authentication', async () => {
      await req(app).get('/api/subscription-templates').expect(401);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/subscription-templates/:id
  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /api/subscription-templates/:id', () => {
    it('ST06: should return a global template by id', async () => {
      // Get list first to get a valid id
      const listRes = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const globalTemplate = listRes.body.find(
        (t: any) => t.ownership === 'GLOBAL',
      );
      expect(globalTemplate).toBeDefined();

      const res = await req(app)
        .get(`/api/subscription-templates/${globalTemplate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(globalTemplate.id);
      expect(res.body.name).toBe(globalTemplate.name);
      expect(res.body.ownership).toBe('GLOBAL');
    });

    it('ST07: should return a user-owned template by id', async () => {
      const createRes = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Personal Template',
          templateCategory: 'PRODUCTIVITY',
          defaultFrequency: 'MONTHLY',
          defaultAmount: 4.99,
          serviceUrl: 'https://example.com/app',
        })
        .expect(201);

      const res = await req(app)
        .get(`/api/subscription-templates/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(createRes.body.id);
      expect(res.body.name).toBe('My Personal Template');
      expect(res.body.ownership).toBe('USER');
    });

    it("ST08: should return 404 for another user's private template", async () => {
      const createRes = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Invisible Template',
          templateCategory: 'OTHER',
          defaultFrequency: 'MONTHLY',
          serviceUrl: 'https://example.com/invisible',
        })
        .expect(201);

      await req(app)
        .get(`/api/subscription-templates/${createRes.body.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('ST09: should return 404 for non-existent id', async () => {
      await req(app)
        .get('/api/subscription-templates/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/subscription-templates
  // ──────────────────────────────────────────────────────────────────────────
  describe('POST /api/subscription-templates', () => {
    it('ST10: should create a user template with all fields', async () => {
      const res = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Streaming Service',
          description: 'My personal streaming service',
          iconUrl: 'https://example.com/icon.png',
          serviceUrl: 'https://example.com',
          defaultAmount: 9.99,
          defaultFrequency: 'MONTHLY',
          templateCategory: 'STREAMING',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('ST11: should create a template with minimal fields (defaults applied)', async () => {
      const res = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Minimal Template',
          templateCategory: 'EDUCATION',
          serviceUrl: 'https://example.com/education',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');

      const getRes = await req(app)
        .get(`/api/subscription-templates/${res.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getRes.body.defaultFrequency).toBe('MONTHLY');
      expect(getRes.body.ownership).toBe('USER');
    });

    it('ST12: should return 400 for missing required name', async () => {
      await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          templateCategory: 'STREAMING',
        })
        .expect(400);
    });

    it('ST13: should return 400 for invalid templateCategory', async () => {
      await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bad Category Template',
          templateCategory: 'INVALID_CATEGORY',
        })
        .expect(400);
    });

    it('ST14: should return 400 for invalid defaultFrequency', async () => {
      await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bad Frequency Template',
          templateCategory: 'STREAMING',
          defaultFrequency: 'INVALID_FREQUENCY',
        })
        .expect(400);
    });

    it('ST15: should return 401 without authentication', async () => {
      await req(app)
        .post('/api/subscription-templates')
        .send({
          name: 'Unauthorized Template',
          templateCategory: 'STREAMING',
        })
        .expect(401);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PATCH /api/subscription-templates/:id
  // ──────────────────────────────────────────────────────────────────────────
  describe('PATCH /api/subscription-templates/:id', () => {
    let userTemplateId: string;

    beforeAll(async () => {
      const res = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Template To Update',
          templateCategory: 'GAMING',
          defaultFrequency: 'MONTHLY',
          defaultAmount: 5.0,
          serviceUrl: 'https://example.com/game',
        })
        .expect(201);

      userTemplateId = res.body.id;
    });

    it('ST16: should update a user-owned template', async () => {
      const res = await req(app)
        .patch(`/api/subscription-templates/${userTemplateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Template Name',
          defaultAmount: 7.99,
        })
        .expect(200);

      expect(res.body).toHaveProperty('id', userTemplateId);

      const getRes = await req(app)
        .get(`/api/subscription-templates/${userTemplateId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getRes.body.name).toBe('Updated Template Name');
      expect(getRes.body.defaultAmount).toBe(7.99);
    });

    it('ST17: should return 403 when updating a global template', async () => {
      const listRes = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const globalTemplate = listRes.body.find(
        (t: any) => t.ownership === 'GLOBAL',
      );
      expect(globalTemplate).toBeDefined();

      await req(app)
        .patch(`/api/subscription-templates/${globalTemplate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Trying to update global' })
        .expect(403);
    });

    it("ST18: should return 404 when updating another user's template", async () => {
      await req(app)
        .patch(`/api/subscription-templates/${userTemplateId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hijacked name' })
        .expect(404);
    });

    it('ST19: should return 404 for non-existent template', async () => {
      await req(app)
        .patch(
          '/api/subscription-templates/00000000-0000-0000-0000-000000000000',
        )
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ghost Template' })
        .expect(404);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE /api/subscription-templates/:id
  // ──────────────────────────────────────────────────────────────────────────
  describe('DELETE /api/subscription-templates/:id', () => {
    let templateToDeleteId: string;

    beforeAll(async () => {
      const res = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Template To Delete',
          templateCategory: 'CLOUD_STORAGE',
          serviceUrl: 'https://example.com/storage',
        })
        .expect(201);

      templateToDeleteId = res.body.id;
    });

    it('ST20: should delete a user-owned template and return 204', async () => {
      await req(app)
        .delete(`/api/subscription-templates/${templateToDeleteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await req(app)
        .get(`/api/subscription-templates/${templateToDeleteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('ST21: should return 403 when deleting a global template', async () => {
      const listRes = await req(app)
        .get('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const globalTemplate = listRes.body.find(
        (t: any) => t.ownership === 'GLOBAL',
      );
      expect(globalTemplate).toBeDefined();

      await req(app)
        .delete(`/api/subscription-templates/${globalTemplate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it("ST22: should return 404 when deleting another user's template", async () => {
      const createRes = await req(app)
        .post('/api/subscription-templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Another User Cannot Delete This',
          templateCategory: 'SECURITY_VPN',
          serviceUrl: 'https://example.com/vpn',
        })
        .expect(201);

      await req(app)
        .delete(`/api/subscription-templates/${createRes.body.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('ST23: should return 404 for non-existent template', async () => {
      await req(app)
        .delete(
          '/api/subscription-templates/00000000-0000-0000-0000-000000000000',
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
