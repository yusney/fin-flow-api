import { INestApplication } from '@nestjs/common';
import { createTestApp, req } from './setup';

describe('Full User Journey (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete the entire user journey', async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-15`;

    // 1. Register user
    const registerRes = await req(app)
      .post('/api/auth/register')
      .send({
        name: 'Journey User',
        email: 'journey@example.com',
        password: 'journey123',
      })
      .expect(201);

    expect(registerRes.body).toHaveProperty('id');

    // 2. Login
    const loginRes = await req(app)
      .post('/api/auth/login')
      .send({ email: 'journey@example.com', password: 'journey123' })
      .expect(200);

    expect(loginRes.body).toHaveProperty('access_token');
    const token = loginRes.body.access_token;
    const auth = { Authorization: `Bearer ${token}` };

    // 3. Create expense category "Food"
    const foodCatRes = await req(app)
      .post('/api/categories')
      .set(auth)
      .send({ name: 'Food', type: 'expense' })
      .expect(201);

    expect(foodCatRes.body).toHaveProperty('id');
    const foodCategoryId = foodCatRes.body.id;

    // 4. Create income category "Salary"
    const salaryCatRes = await req(app)
      .post('/api/categories')
      .set(auth)
      .send({ name: 'Salary', type: 'income' })
      .expect(201);

    expect(salaryCatRes.body).toHaveProperty('id');
    const salaryCategoryId = salaryCatRes.body.id;

    // Verify categories exist by listing
    const catListRes = await req(app)
      .get('/api/categories')
      .set(auth)
      .expect(200);

    const catNames = catListRes.body.map((c: any) => c.name);
    expect(catNames).toContain('Food');
    expect(catNames).toContain('Salary');

    // 5. Create expense transaction (Food, $50)
    const expenseTxRes = await req(app)
      .post('/api/transactions')
      .set(auth)
      .send({
        amount: 50,
        description: 'Groceries',
        date: dateStr,
        categoryId: foodCategoryId,
      })
      .expect(201);

    expect(expenseTxRes.body).toHaveProperty('id');

    // 6. Create income transaction (Salary, $3000)
    const incomeTxRes = await req(app)
      .post('/api/transactions')
      .set(auth)
      .send({
        amount: 3000,
        description: 'Monthly Salary',
        date: dateStr,
        categoryId: salaryCategoryId,
      })
      .expect(201);

    expect(incomeTxRes.body).toHaveProperty('id');

    // 7. Get summary -> verify totalIncome=3000, totalExpense=50, balance=2950
    const summaryRes = await req(app)
      .get('/api/transactions/summary')
      .set(auth)
      .query({ month, year })
      .expect(200);

    expect(Number(summaryRes.body.totalIncome)).toBe(3000);
    expect(Number(summaryRes.body.totalExpense)).toBe(50);
    expect(Number(summaryRes.body.balance)).toBe(2950);

    // 8. Create budget for Food category, limit $200
    const budgetRes = await req(app)
      .post('/api/budgets')
      .set(auth)
      .send({
        limitAmount: 200,
        month,
        year,
        categoryId: foodCategoryId,
      })
      .expect(201);

    expect(budgetRes.body).toHaveProperty('id');

    // 9. Get budget status -> verify spent=$50, remaining=$150
    const budgetStatusRes = await req(app)
      .get('/api/budgets/status')
      .set(auth)
      .query({ month, year })
      .expect(200);

    expect(Array.isArray(budgetStatusRes.body)).toBe(true);
    const foodBudget = budgetStatusRes.body.find(
      (b: any) => b.categoryId === foodCategoryId,
    );
    expect(foodBudget).toBeDefined();
    expect(Number(foodBudget.limitAmount)).toBe(200);
    expect(Number(foodBudget.spent)).toBe(50);
    expect(Number(foodBudget.remaining)).toBe(150);

    // 10. Create subscription for Food category
    const subRes = await req(app)
      .post('/api/subscriptions')
      .set(auth)
      .send({
        amount: 15,
        description: 'Meal Kit Delivery',
        billingDay: 1,
        categoryId: foodCategoryId,
      })
      .expect(201);

    expect(subRes.body).toHaveProperty('id');
    const subscriptionId = subRes.body.id;

    // 11. List subscriptions -> verify
    const listSubsRes = await req(app)
      .get('/api/subscriptions')
      .set(auth)
      .expect(200);

    expect(Array.isArray(listSubsRes.body)).toBe(true);
    expect(listSubsRes.body.length).toBeGreaterThanOrEqual(1);
    const foundSub = listSubsRes.body.find((s: any) => s.id === subscriptionId);
    expect(foundSub).toBeDefined();
    expect(foundSub.description).toBe('Meal Kit Delivery');
    expect(foundSub.isActive).toBe(true);

    // 12. Toggle subscription -> verify isActive changed
    const toggleRes = await req(app)
      .put(`/api/subscriptions/${subscriptionId}/toggle`)
      .set(auth)
      .expect(200);

    expect(toggleRes.body.id).toBe(subscriptionId);
    expect(toggleRes.body.isActive).toBe(false);

    // Verify toggled state persists
    const listAfterToggle = await req(app)
      .get('/api/subscriptions')
      .set(auth)
      .expect(200);

    const toggledSub = listAfterToggle.body.find(
      (s: any) => s.id === subscriptionId,
    );
    expect(toggledSub.isActive).toBe(false);
  });
});
