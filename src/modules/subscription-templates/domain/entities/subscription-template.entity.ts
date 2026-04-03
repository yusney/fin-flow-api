import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../enums/template-category.enum';
import { TemplateOwnership } from '../enums/template-ownership.enum';

export class SubscriptionTemplate extends BaseEntity {
  public name: string;
  public description: string | null;
  public iconUrl: string | null;
  public serviceUrl: string | null;
  public defaultAmount: number;
  public defaultFrequency: BillingFrequency;
  public category: TemplateCategory;
  public ownership: TemplateOwnership;
  public userId: string | null;

  constructor(
    name: string,
    description: string | null,
    iconUrl: string | null,
    serviceUrl: string | null,
    defaultAmount: number,
    defaultFrequency: BillingFrequency,
    category: TemplateCategory,
    ownership: TemplateOwnership,
    userId: string | null,
    id?: string,
  ) {
    super(id);
    this.name = name;
    this.description = description;
    this.iconUrl = iconUrl;
    this.serviceUrl = serviceUrl;
    this.defaultAmount = defaultAmount;
    this.defaultFrequency = defaultFrequency;
    this.category = category;
    this.ownership = ownership;
    this.userId = userId;
  }

  static create(props: {
    name: string;
    description: string | null;
    iconUrl: string | null;
    serviceUrl: string | null;
    defaultAmount: number;
    defaultFrequency: BillingFrequency;
    category: TemplateCategory;
    ownership: TemplateOwnership;
    userId: string | null;
    id?: string;
  }): SubscriptionTemplate {
    const trimmedName = props.name?.trim() ?? '';

    if (!trimmedName || trimmedName.length === 0) {
      throw new ValidationException('Name is required');
    }

    if (trimmedName.length > 100) {
      throw new ValidationException('Name must not exceed 100 characters');
    }

    if (props.defaultAmount <= 0) {
      throw new ValidationException('Default amount must be a positive number');
    }

    const validCategories = Object.values(TemplateCategory) as string[];
    if (!validCategories.includes(props.category)) {
      throw new ValidationException('Invalid template category');
    }

    const validFrequencies = Object.values(BillingFrequency) as string[];
    if (!validFrequencies.includes(props.defaultFrequency)) {
      throw new ValidationException('Invalid billing frequency');
    }

    if (props.ownership === TemplateOwnership.GLOBAL && props.userId !== null) {
      throw new ValidationException('Global templates must not have a userId');
    }

    if (props.ownership === TemplateOwnership.USER && !props.userId) {
      throw new ValidationException('User templates must have a userId');
    }

    if (props.ownership === TemplateOwnership.GLOBAL && !props.serviceUrl) {
      throw new ValidationException('Global templates must have a serviceUrl');
    }

    return new SubscriptionTemplate(
      trimmedName,
      props.description,
      props.iconUrl,
      props.serviceUrl,
      props.defaultAmount,
      props.defaultFrequency,
      props.category,
      props.ownership,
      props.userId,
      props.id,
    );
  }

  update(props: {
    name?: string;
    description?: string | null;
    iconUrl?: string | null;
    serviceUrl?: string | null;
    defaultAmount?: number;
    defaultFrequency?: BillingFrequency;
    category?: TemplateCategory;
  }): void {
    if (props.name !== undefined) {
      const trimmedName = props.name.trim();

      if (!trimmedName || trimmedName.length === 0) {
        throw new ValidationException('Name is required');
      }

      if (trimmedName.length > 100) {
        throw new ValidationException('Name must not exceed 100 characters');
      }

      this.name = trimmedName;
    }

    if (props.defaultAmount !== undefined) {
      if (props.defaultAmount <= 0) {
        throw new ValidationException(
          'Default amount must be a positive number',
        );
      }
      this.defaultAmount = props.defaultAmount;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.iconUrl !== undefined) {
      this.iconUrl = props.iconUrl;
    }

    if (props.serviceUrl !== undefined) {
      this.serviceUrl = props.serviceUrl;
    }

    if (props.defaultFrequency !== undefined) {
      this.defaultFrequency = props.defaultFrequency;
    }

    if (props.category !== undefined) {
      this.category = props.category;
    }

    this.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  isGlobal(): boolean {
    return this.ownership === TemplateOwnership.GLOBAL;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      serviceUrl: this.serviceUrl,
      defaultAmount: this.defaultAmount,
      defaultFrequency: this.defaultFrequency,
      category: this.category,
      ownership: this.ownership,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
