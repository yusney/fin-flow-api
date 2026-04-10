import { Migration } from '@mikro-orm/migrations';

export class Migration00006AddSubscriptionParentId extends Migration {
  up(): void {
    this.addSql(
      'ALTER TABLE subscriptions ADD COLUMN parent_id UUID NULL REFERENCES subscriptions(id);',
    );
    this.addSql(
      'CREATE INDEX idx_subscriptions_parent_id ON subscriptions(parent_id);',
    );
  }

  down(): void {
    this.addSql('DROP INDEX IF EXISTS idx_subscriptions_parent_id;');
    this.addSql('ALTER TABLE subscriptions DROP COLUMN IF EXISTS parent_id;');
  }
}
