import { Migration } from '@mikro-orm/migrations';

export class Migration00001_initial extends Migration {
  override up(): void {
    // Users table
    this.addSql(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Categories table
    this.addSql(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "type" varchar(10) NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Transactions table
    this.addSql(`
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY,
        "amount" decimal(12,2) NOT NULL,
        "description" varchar(255) NOT NULL,
        "date" date NOT NULL,
        "category_id" uuid NOT NULL REFERENCES "categories"("id"),
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Budgets table
    this.addSql(`
      CREATE TABLE "budgets" (
        "id" uuid PRIMARY KEY,
        "limit_amount" decimal(12,2) NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "category_id" uuid NOT NULL REFERENCES "categories"("id"),
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        UNIQUE ("user_id", "category_id", "month", "year")
      );
    `);

    // Subscriptions table
    this.addSql(`
      CREATE TABLE "subscriptions" (
        "id" uuid PRIMARY KEY,
        "amount" decimal(12,2) NOT NULL,
        "description" varchar(255) NOT NULL,
        "billing_day" integer NOT NULL,
        "category_id" uuid NOT NULL REFERENCES "categories"("id"),
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Indexes
    this.addSql(
      'CREATE INDEX "idx_categories_user_id" ON "categories" ("user_id");',
    );
    this.addSql(
      'CREATE INDEX "idx_transactions_user_id" ON "transactions" ("user_id");',
    );
    this.addSql(
      'CREATE INDEX "idx_transactions_category_id" ON "transactions" ("category_id");',
    );
    this.addSql(
      'CREATE INDEX "idx_transactions_date" ON "transactions" ("date");',
    );
    this.addSql('CREATE INDEX "idx_budgets_user_id" ON "budgets" ("user_id");');
    this.addSql(
      'CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" ("user_id");',
    );
    this.addSql(
      'CREATE INDEX "idx_subscriptions_billing_day" ON "subscriptions" ("billing_day");',
    );
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS "subscriptions" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "budgets" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "transactions" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "categories" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "users" CASCADE;');
  }
}
