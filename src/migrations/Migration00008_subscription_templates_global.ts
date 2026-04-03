import { Migration } from '@mikro-orm/migrations';

export class Migration00008_subscription_templates_global extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'ALTER TABLE "subscription_templates" DROP COLUMN IF EXISTS "ownership";',
    );
    this.addSql(
      'ALTER TABLE "subscription_templates" DROP COLUMN IF EXISTS "user_id";',
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      'ALTER TABLE "subscription_templates" ADD COLUMN "ownership" varchar(10) DEFAULT \'GLOBAL\' NOT NULL;',
    );
    this.addSql(
      'ALTER TABLE "subscription_templates" ADD COLUMN "user_id" uuid NULL;',
    );
    this.addSql(
      'CREATE INDEX "idx_subscription_templates_user_id" ON "subscription_templates" ("user_id");',
    );
  }
}
