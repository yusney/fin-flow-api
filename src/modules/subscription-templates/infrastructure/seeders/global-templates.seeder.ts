import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { GLOBAL_TEMPLATES } from './seed-data';

@Injectable()
export class GlobalTemplatesSeeder implements OnModuleInit {
  private readonly logger = new Logger(GlobalTemplatesSeeder.name);

  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    // Skip seeding in test environment - tests manage their own data
    if (process.env.NODE_ENV === 'test') {
      this.logger.log('GlobalTemplatesSeeder: skipped in test environment');
      return;
    }

    // Allow skipping seeding via environment variable (useful for debugging deployments)
    if (process.env.SKIP_SEEDING === 'true') {
      this.logger.log(
        'GlobalTemplatesSeeder: skipped via SKIP_SEEDING env var',
      );
      return;
    }

    try {
      await this.seed();
    } catch (error) {
      // Log error but don't crash the app - seeding is not critical for app startup
      // The app can function without global templates, they can be seeded later
      this.logger.error(
        `GlobalTemplatesSeeder: failed to seed global templates. ` +
          `This is non-fatal, the app will continue. Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async seed(): Promise<void> {
    let created = 0;
    let skipped = 0;

    for (const templateData of GLOBAL_TEMPLATES) {
      const existing = await this.subscriptionTemplateRepository.findByName(
        templateData.name,
      );

      if (existing) {
        skipped++;
        continue;
      }

      const template = SubscriptionTemplate.create({
        name: templateData.name,
        description: templateData.description,
        iconUrl: templateData.iconUrl,
        serviceUrl: templateData.serviceUrl,
        defaultAmount: templateData.defaultAmount,
        defaultFrequency: templateData.defaultFrequency,
        category: templateData.category,
      });

      await this.subscriptionTemplateRepository.save(template);
      created++;
    }

    this.logger.log(
      `GlobalTemplatesSeeder: ${created} created, ${skipped} skipped`,
    );
  }
}
