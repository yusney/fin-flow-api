import { Migration } from '@mikro-orm/migrations';

export class Migration00007_user_preferences extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "user_preferences" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "currency" varchar(3) NOT NULL DEFAULT 'USD',
        "date_format" varchar(10) NOT NULL DEFAULT 'MM/DD/YYYY',
        "language" varchar(2) NOT NULL DEFAULT 'en',
        "email_notifications" boolean NOT NULL DEFAULT true,
        "push_notifications" boolean NOT NULL DEFAULT false,
        "budget_alerts" boolean NOT NULL DEFAULT true,
        "subscription_reminders" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    this.addSql(
      'CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences" ("user_id");',
    );

    // Backfill defaults for existing users
    this.addSql(`
      INSERT INTO "user_preferences" ("id", "user_id")
      SELECT gen_random_uuid(), "id"
      FROM "users"
      WHERE "id" NOT IN (SELECT "user_id" FROM "user_preferences");
    `);
  }

  override async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "user_preferences" CASCADE;');
  }
}
