import { INestApplication } from '@nestjs/common';
import { createTestApp, registerAndLogin, req } from './setup';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let expenseCategoryId: string;
  let _incomeCategoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app);
    token = auth.token;

    const expenseRes = await req(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Food', type: 'expense' })
      .expect(201);
    expenseCategoryId = expenseRes.body.id;

    const incomeRes = await req(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salary', type: 'income' })
      .expect(201);
    _incomeCategoryId = incomeRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction and return { id }', async () => {
      const now = new Date();
      const res = await req(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50,
          description: 'Lunch',
          date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`,
          categoryId: expenseCategoryId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
    });

    it('should return 400 for missing required fields', async () => {
      await req(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50 })
        .expect(400);
    });

    it('should return 400 for negative amount', async () => {
      await req(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -10,
          description: 'Bad',
          date: '2026-03-15',
          categoryId: expenseCategoryId,
        })
        .expect(400);
    });
  });

  describe('GET /api/transactions', () => {
    it('should list transactions for the user', async () => {
      const res = await req(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('amount');
      expect(res.body[0]).toHaveProperty('description');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction and return 200', async () => {
      const now = new Date();
      const createRes = await req(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 30,
          description: 'Coffee',
          date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`,
          categoryId: expenseCategoryId,
        })
        .expect(201);

      const txId = createRes.body.id;

      await req(app)
        .put(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 35, description: 'Fancy Coffee' })
        .expect(200);

      // Verify the update by listing
      const listRes = await req(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const updated = listRes.body.find((t: any) => t.id === txId);
      expect(updated).toBeDefined();
      expect(Number(updated.amount)).toBe(35);
      expect(updated.description).toBe('Fancy Coffee');
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const now = new Date();
      const createRes = await req(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 20,
          description: 'To Delete',
          date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-12`,
          categoryId: expenseCategoryId,
        })
        .expect(201);

      const txId = createRes.body.id;

      await req(app)
        .delete(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const listRes = await req(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const ids = listRes.body.map((t: any) => t.id);
      expect(ids).not.toContain(txId);
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should return correct summary totals', async () => {
      const freshApp = await createTestApp();
      const auth = await registerAndLogin(freshApp);
      const freshToken = auth.token;

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-15`;

      const expRes = await req(freshApp)
        .post('/api/categories')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({ name: 'Food', type: 'expense' })
        .expect(201);

      const incRes = await req(freshApp)
        .post('/api/categories')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({ name: 'Salary', type: 'income' })
        .expect(201);

      await req(freshApp)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({
          amount: 50,
          description: 'Dinner',
          date: dateStr,
          categoryId: expRes.body.id,
        })
        .expect(201);

      await req(freshApp)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({
          amount: 3000,
          description: 'Monthly Salary',
          date: dateStr,
          categoryId: incRes.body.id,
        })
        .expect(201);

      const summaryRes = await req(freshApp)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${freshToken}`)
        .query({ month, year })
        .expect(200);

      expect(Number(summaryRes.body.totalIncome)).toBe(3000);
      expect(Number(summaryRes.body.totalExpense)).toBe(50);
      expect(Number(summaryRes.body.balance)).toBe(2950);

      await freshApp.close();
    });
  });
});
