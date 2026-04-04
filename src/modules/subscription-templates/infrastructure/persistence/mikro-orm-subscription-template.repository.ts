import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

@Injectable()
export class MikroOrmSubscriptionTemplateRepository implements ISubscriptionTemplateRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<SubscriptionTemplate | null> {
    return this.em.findOne(SubscriptionTemplate, { id });
  }

  async findAll(category?: TemplateCategory): Promise<SubscriptionTemplate[]> {
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    return this.em.find(SubscriptionTemplate, filter, {
      orderBy: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<SubscriptionTemplate | null> {
    return this.em.findOne(SubscriptionTemplate, { name });
  }

  async save(template: SubscriptionTemplate): Promise<void> {
    this.em.persist(template);
    await this.em.flush();
  }
}
