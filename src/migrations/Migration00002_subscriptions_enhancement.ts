import { Migration } from '@mikro-orm/migrations';

export class Migration00002_subscriptions_enhancement extends Migration {
  override async up(): Promise<void> {
    // Add new columns to subscriptions
    this.addSql(`
      ALTER TABLE "subscriptions"
        ADD COLUMN "start_date" timestamptz NOT NULL DEFAULT now(),
        ADD COLUMN "end_date" timestamptz DEFAULT NULL,
        ADD COLUMN "frequency" varchar(20) NOT NULL DEFAULT 'MONTHLY',
        ADD COLUMN "type" varchar(20) NOT NULL DEFAULT 'GENERAL',
        ADD COLUMN "service_url" varchar(2048) DEFAULT NULL;
    `);

    // Backfill start_date from created_at for existing records
    this.addSql(`UPDATE "subscriptions" SET "start_date" = "created_at";`);

    // Indexes for billing queries
    this.addSql('CREATE INDEX "idx_subscriptions_frequency" ON "subscriptions" ("frequency");');
    this.addSql('CREATE INDEX "idx_subscriptions_start_date" ON "subscriptions" ("start_date");');
  }

  override async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS "idx_subscriptions_start_date";');
    this.addSql('DROP INDEX IF EXISTS "idx_subscriptions_frequency";');
    this.addSql(`
      ALTER TABLE "subscriptions"
        DROP COLUMN "start_date",
        DROP COLUMN "end_date",
        DROP COLUMN "frequency",
        DROP COLUMN "type",
        DROP COLUMN "service_url";
    `);
  }
}
