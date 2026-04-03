import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';

@Injectable()
export class MikroOrmSubscriptionTemplateRepository implements ISubscriptionTemplateRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<SubscriptionTemplate | null> {
    return this.em.findOne(SubscriptionTemplate, { id });
  }

  async findVisibleByUser(
    userId: string,
    category?: TemplateCategory,
  ): Promise<SubscriptionTemplate[]> {
    const filter: any = {
      $or: [{ ownership: TemplateOwnership.GLOBAL }, { userId }],
    };

    if (category) {
      filter.category = category;
    }

    return this.em.find(SubscriptionTemplate, filter, {
      orderBy: { name: 'ASC' },
    });
  }

  async findByNameAndOwnership(
    name: string,
    ownership: string,
    userId?: string | null,
  ): Promise<SubscriptionTemplate | null> {
    const filter: any = { name, ownership };

    if (userId !== undefined && userId !== null) {
      filter.userId = userId;
    }

    return this.em.findOne(SubscriptionTemplate, filter);
  }

  async save(template: SubscriptionTemplate): Promise<void> {
    this.em.persist(template);
    await this.em.flush();
  }

  async update(template: SubscriptionTemplate): Promise<void> {
    await this.em.flush();
  }

  async delete(template: SubscriptionTemplate): Promise<void> {
    this.em.remove(template);
    await this.em.flush();
  }
}
