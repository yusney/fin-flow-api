import { Migration } from '@mikro-orm/migrations';

export class Migration00004_addCheckConstraintsAndIndexes extends Migration {
  override up(): void {
    // ============================================
    // SECTION 1: FK Indexes (Performance)
    // ============================================

    // Index for budgets.category_id (used in FK joins - PostgreSQL doesn't auto-index FK)
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "idx_budgets_category_id" ON "budgets" ("category_id");',
    );

    // ============================================
    // SECTION 2: CHECK Constraints for budgets
    // ============================================

    // 2.1 limit_amount must be positive
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_budgets_limit_amount_positive'
        ) THEN
          ALTER TABLE budgets ADD CONSTRAINT chk_budgets_limit_amount_positive CHECK (limit_amount >= 0);
        END IF;
      END $$;
    `);

    // 2.2 month must be 1-12
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_budgets_month_valid'
        ) THEN
          ALTER TABLE budgets ADD CONSTRAINT chk_budgets_month_valid CHECK (month BETWEEN 1 AND 12);
        END IF;
      END $$;
    `);

    // 2.3 year must be reasonable range
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_budgets_year_valid'
        ) THEN
          ALTER TABLE budgets ADD CONSTRAINT chk_budgets_year_valid CHECK (year BETWEEN 2000 AND 2100);
        END IF;
      END $$;
    `);

    // ============================================
    // SECTION 3: CHECK Constraints for subscriptions
    // ============================================

    // 3.1 billing_day must be 1-31
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscriptions_billing_day_valid'
        ) THEN
          ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_billing_day_valid CHECK (billing_day BETWEEN 1 AND 31);
        END IF;
      END $$;
    `);

    // 3.2 amount must be positive
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscriptions_amount_positive'
        ) THEN
          ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_amount_positive CHECK (amount >= 0);
        END IF;
      END $$;
    `);

    // ============================================
    // SECTION 4: CHECK Constraints for transactions
    // ============================================

    // 4.1 amount must be positive
    this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_transactions_amount_positive'
        ) THEN
          ALTER TABLE transactions ADD CONSTRAINT chk_transactions_amount_positive CHECK (amount >= 0);
        END IF;
      END $$;
    `);
  }

  override down(): void {
    // Drop indexes
    this.addSql('DROP INDEX IF EXISTS "idx_budgets_category_id";');

    // Drop CHECK constraints from budgets
    this.addSql(
      'ALTER TABLE budgets DROP CONSTRAINT IF EXISTS chk_budgets_limit_amount_positive;',
    );
    this.addSql(
      'ALTER TABLE budgets DROP CONSTRAINT IF EXISTS chk_budgets_month_valid;',
    );
    this.addSql(
      'ALTER TABLE budgets DROP CONSTRAINT IF EXISTS chk_budgets_year_valid;',
    );

    // Drop CHECK constraints from subscriptions
    this.addSql(
      'ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_billing_day_valid;',
    );
    this.addSql(
      'ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_amount_positive;',
    );

    // Drop CHECK constraints from transactions
    this.addSql(
      'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS chk_transactions_amount_positive;',
    );
  }
}
