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

  async findAll(category?: TemplateCategory): Promise<SubscriptionTemplate[]> {
    const filter: {
      category?: TemplateCategory;
      ownership: TemplateOwnership;
    } = {
      ownership: TemplateOwnership.GLOBAL,
    };

    if (category) {
      filter.category = category;
    }

    return this.em.find(SubscriptionTemplate, filter, {
      orderBy: { name: 'ASC' },
    });
  }

  async findAllForUser(
    userId: string,
    category?: TemplateCategory,
  ): Promise<SubscriptionTemplate[]> {
    // Single query with $or to find all templates the user can access:
    // - Global templates (accessible to everyone)
    // - User-owned templates (only if owned by this user)
    const filter: Record<string, unknown> = {
      $or: [
        { ownership: TemplateOwnership.GLOBAL },
        { ownership: TemplateOwnership.USER, userId },
      ],
    };

    if (category) {
      filter.category = category;
    }

    return this.em.find(SubscriptionTemplate, filter, {
      orderBy: { name: 'ASC' },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<SubscriptionTemplate | null> {
    // Single query with $or to find templates the user can access:
    // - Global templates (accessible to everyone)
    // - User-owned templates (only if owned by this user)
    return this.em.findOne(SubscriptionTemplate, {
      id,
      $or: [
        { ownership: TemplateOwnership.GLOBAL },
        { ownership: TemplateOwnership.USER, userId },
      ],
    });
  }

  async findByName(name: string): Promise<SubscriptionTemplate | null> {
    return this.em.findOne(SubscriptionTemplate, { name });
  }

  async save(template: SubscriptionTemplate): Promise<void> {
    this.em.persist(template);
    await this.em.flush();
  }

  async delete(template: SubscriptionTemplate): Promise<void> {
    this.em.remove(template);
    await this.em.flush();
  }
}
