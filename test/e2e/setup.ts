import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MikroORM, defineConfig } from '@mikro-orm/postgresql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfig, jwtConfig } from '../../src/config';
import { SharedModule } from '../../src/shared/shared.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { CategoriesModule } from '../../src/modules/categories/categories.module';
import { TransactionsModule } from '../../src/modules/transactions/transactions.module';
import { BudgetsModule } from '../../src/modules/budgets/budgets.module';
import { SubscriptionsModule } from '../../src/modules/subscriptions/subscriptions.module';
import { SubscriptionTemplatesModule } from '../../src/modules/subscription-templates/subscription-templates.module';
import { PreferencesModule } from '../../src/modules/preferences/preferences.module';
import { UserSchema } from '../../src/modules/auth/infrastructure/persistence/user.schema';
import { CategorySchema } from '../../src/modules/categories/infrastructure/persistence/category.schema';
import { TransactionSchema } from '../../src/modules/transactions/infrastructure/persistence/transaction.schema';
import { BudgetSchema } from '../../src/modules/budgets/infrastructure/persistence/budget.schema';
import { SubscriptionSchema } from '../../src/modules/subscriptions/infrastructure/persistence/subscription.schema';
import { SubscriptionTemplateSchema } from '../../src/modules/subscription-templates/infrastructure/persistence/subscription-template.schema';
import { UserPreferencesSchema } from '../../src/modules/preferences/infrastructure/persistence/user-preferences.schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const supertest = require('supertest');

const testOrmConfig = defineConfig({
  clientUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/fin_flow_test',
  entities: [
    UserSchema,
    CategorySchema,
    TransactionSchema,
    BudgetSchema,
    SubscriptionSchema,
    SubscriptionTemplateSchema,
    UserPreferencesSchema,
  ],
  allowGlobalContext: true,
});

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [appConfig, jwtConfig],
      }),
      MikroOrmModule.forRoot(testOrmConfig),
      CqrsModule.forRoot(),
      ScheduleModule.forRoot(),
      SharedModule,
      AuthModule,
      CategoriesModule,
      TransactionsModule,
      BudgetsModule,
      SubscriptionsModule,
      SubscriptionTemplatesModule,
      PreferencesModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  const orm = app.get(MikroORM);
  await orm.schema.refresh();

  return app;
}

export async function clearDatabase(app: INestApplication): Promise<void> {
  const orm = app.get(MikroORM);
  await orm.schema.clear();
}

export function req(app: INestApplication) {
  return supertest(app.getHttpServer());
}

export async function registerAndLogin(
  app: INestApplication,
  userData?: { name?: string; email?: string; password?: string },
): Promise<{ token: string; userId: string }> {
  const name = userData?.name || 'Test User';
  const email = userData?.email || `test-${Date.now()}@example.com`;
  const password = userData?.password || 'password123';

  const registerRes = await req(app)
    .post('/api/auth/register')
    .send({ name, email, password })
    .expect(201);

  const loginRes = await req(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    token: loginRes.body.access_token,
    userId: registerRes.body.id,
  };
}
