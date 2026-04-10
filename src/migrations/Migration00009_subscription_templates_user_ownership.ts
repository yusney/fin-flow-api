import { Migration } from '@mikro-orm/migrations';

export class Migration00009_subscription_templates_user_ownership extends Migration {
  override up(): void {
    // Re-add ownership and user_id columns removed in Migration00008
    this.addSql(
      `ALTER TABLE "subscription_templates" ADD COLUMN IF NOT EXISTS "ownership" varchar(10) NOT NULL DEFAULT 'GLOBAL';`,
    );
    this.addSql(
      `ALTER TABLE "subscription_templates" ADD COLUMN IF NOT EXISTS "user_id" uuid NULL;`,
    );

    // Drop old unique constraint on name alone
    this.addSql(
      `ALTER TABLE "subscription_templates" DROP CONSTRAINT IF EXISTS "uq_subscription_templates_name";`,
    );

    // Add new unique constraint on (name, ownership, user_id)
    this.addSql(
      `ALTER TABLE "subscription_templates" ADD CONSTRAINT "uq_subscription_templates_name_ownership_user" UNIQUE ("name", "ownership", "user_id");`,
    );

    // Add index on user_id
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "idx_subscription_templates_user_id" ON "subscription_templates" ("user_id");`,
    );
  }

  override down(): void {
    this.addSql(
      `ALTER TABLE "subscription_templates" DROP CONSTRAINT IF EXISTS "uq_subscription_templates_name_ownership_user";`,
    );
    this.addSql(`DROP INDEX IF EXISTS "idx_subscription_templates_user_id";`);
    this.addSql(
      `ALTER TABLE "subscription_templates" ADD CONSTRAINT "uq_subscription_templates_name" UNIQUE ("name");`,
    );
    this.addSql(
      `ALTER TABLE "subscription_templates" DROP COLUMN IF EXISTS "ownership";`,
    );
    this.addSql(
      `ALTER TABLE "subscription_templates" DROP COLUMN IF EXISTS "user_id";`,
    );
  }
}
