import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { GLOBAL_TEMPLATES } from './seed-data';

@Injectable()
export class GlobalTemplatesSeeder implements OnModuleInit {
  private readonly logger = new Logger(GlobalTemplatesSeeder.name);

  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    let created = 0;
    let skipped = 0;

    for (const templateData of GLOBAL_TEMPLATES) {
      const existing =
        await this.subscriptionTemplateRepository.findByNameAndOwnership(
          templateData.name,
          TemplateOwnership.GLOBAL,
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
        ownership: TemplateOwnership.GLOBAL,
        userId: null,
      });

      await this.subscriptionTemplateRepository.save(template);
      created++;
    }

    this.logger.log(
      `GlobalTemplatesSeeder: ${created} created, ${skipped} skipped`,
    );
  }
}
