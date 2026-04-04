import { Migration } from '@mikro-orm/migrations';

export class Migration00005_enhanceEnumCheckConstraints extends Migration {
  override async up(): Promise<void> {
    // ============================================
    // SECTION 1: categories.type - Complete enum values
    // ============================================

    this.addSql(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_type;
    `);
    this.addSql(`
      ALTER TABLE categories ADD CONSTRAINT chk_categories_type 
      CHECK (type IN ('expense', 'income'));
    `);

    // ============================================
    // SECTION 2: subscriptions.frequency - Complete enum values
    // ============================================

    this.addSql(`
      ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_frequency;
    `);
    this.addSql(`
      ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_frequency 
      CHECK (frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
    `);

    // ============================================
    // SECTION 3: subscriptions.type - Complete enum values (includes DIGITAL_SERVICE)
    // ============================================

    this.addSql(`
      ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_type;
    `);
    this.addSql(`
      ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_type 
      CHECK (type IN ('GENERAL', 'STREAMING', 'GAMING', 'PRODUCTIVITY', 'SECURITY', 'DIGITAL_SERVICE'));
    `);

    // ============================================
    // SECTION 4: subscription_templates.template_category - Complete enum values (includes CLOUD_STORAGE)
    // ============================================

    this.addSql(`
      ALTER TABLE subscription_templates DROP CONSTRAINT IF EXISTS chk_templates_category;
    `);
    this.addSql(`
      ALTER TABLE subscription_templates ADD CONSTRAINT chk_templates_category 
      CHECK (template_category IN (
        'STREAMING', 'GAMING', 'PRODUCTIVITY', 'MUSIC', 'SECURITY_VPN',
        'FITNESS_HEALTH', 'NEWS_MEDIA', 'EDUCATION', 'FOOD_DELIVERY', 
        'CLOUD_STORAGE', 'OTHER'
      ));
    `);

    // ============================================
    // SECTION 5: subscription_templates.ownership - Complete enum values
    // ============================================

    this.addSql(`
      ALTER TABLE subscription_templates DROP CONSTRAINT IF EXISTS chk_templates_ownership;
    `);
    this.addSql(`
      ALTER TABLE subscription_templates ADD CONSTRAINT chk_templates_ownership 
      CHECK (ownership IN ('GLOBAL', 'USER'));
    `);
  }

  override async down(): Promise<void> {
    // Revert to original constraints from migration 001
    this.addSql(
      `ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_type;`,
    );
    this.addSql(
      `ALTER TABLE categories ADD CONSTRAINT chk_categories_type CHECK (type IN ('expense', 'income'));`,
    );

    this.addSql(
      `ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_frequency;`,
    );
    this.addSql(
      `ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_frequency CHECK (frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));`,
    );

    this.addSql(
      `ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_type;`,
    );
    this.addSql(
      `ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_type CHECK (type IN ('GENERAL', 'STREAMING', 'GAMING', 'PRODUCTIVITY', 'SECURITY'));`,
    );

    this.addSql(
      `ALTER TABLE subscription_templates DROP CONSTRAINT IF EXISTS chk_templates_category;`,
    );
    this.addSql(
      `ALTER TABLE subscription_templates ADD CONSTRAINT chk_templates_category CHECK (template_category IN ('STREAMING', 'GAMING', 'PRODUCTIVITY', 'MUSIC', 'SECURITY_VPN', 'FITNESS_HEALTH', 'NEWS_MEDIA', 'EDUCATION', 'FOOD_DELIVERY', 'OTHER'));`,
    );

    this.addSql(
      `ALTER TABLE subscription_templates DROP CONSTRAINT IF EXISTS chk_templates_ownership;`,
    );
    this.addSql(
      `ALTER TABLE subscription_templates ADD CONSTRAINT chk_templates_ownership CHECK (ownership IN ('GLOBAL', 'USER'));`,
    );
  }
}
