import { Migration } from '@mikro-orm/migrations';

export class Migration00003_subscription_templates extends Migration {
  override up(): void {
    this.addSql(`
      CREATE TABLE "subscription_templates" (
        "id" uuid PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "description" varchar(500) DEFAULT NULL,
        "icon_url" varchar(2048) DEFAULT NULL,
        "service_url" varchar(2048) DEFAULT NULL,
        "default_amount" decimal(12,2) NOT NULL,
        "default_frequency" varchar(20) NOT NULL DEFAULT 'MONTHLY',
        "template_category" varchar(30) NOT NULL,
        "ownership" varchar(10) NOT NULL,
        "user_id" uuid DEFAULT NULL REFERENCES "users"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    this.addSql(
      'CREATE INDEX "idx_subscription_templates_ownership" ON "subscription_templates" ("ownership");',
    );
    this.addSql(
      'CREATE INDEX "idx_subscription_templates_user_id" ON "subscription_templates" ("user_id");',
    );
    this.addSql(
      'CREATE INDEX "idx_subscription_templates_template_category" ON "subscription_templates" ("template_category");',
    );
    this.addSql(
      'CREATE UNIQUE INDEX "uq_subscription_templates_name_ownership_user" ON "subscription_templates" ("name", "ownership", "user_id");',
    );
  }

  override down(): void {
    this.addSql(
      'DROP INDEX IF EXISTS "uq_subscription_templates_name_ownership_user";',
    );
    this.addSql(
      'DROP INDEX IF EXISTS "idx_subscription_templates_template_category";',
    );
    this.addSql('DROP INDEX IF EXISTS "idx_subscription_templates_user_id";');
    this.addSql('DROP INDEX IF EXISTS "idx_subscription_templates_ownership";');
    this.addSql('DROP TABLE IF EXISTS "subscription_templates" CASCADE;');
  }
}
