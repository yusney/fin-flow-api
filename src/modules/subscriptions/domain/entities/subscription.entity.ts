import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../enums/billing-frequency.enum';
import { SubscriptionType } from '../enums/subscription-type.enum';

export class Subscription extends BaseEntity {
  public amount: number;
  public description: string;
  public billingDay: number;
  public categoryId: string;
  public userId: string;
  public isActive: boolean;
  public startDate: Date;
  public endDate: Date | null;
  public frequency: BillingFrequency;
  public type: SubscriptionType;
  public serviceUrl: string | null;

  constructor(
    amount: number,
    description: string,
    billingDay: number,
    categoryId: string,
    userId: string,
    isActive: boolean,
    startDate: Date,
    endDate: Date | null,
    frequency: BillingFrequency,
    type: SubscriptionType,
    serviceUrl: string | null,
    id?: string,
  ) {
    super(id);
    this.amount = amount;
    this.description = description;
    this.billingDay = billingDay;
    this.categoryId = categoryId;
    this.userId = userId;
    this.isActive = isActive;
    this.startDate = startDate;
    this.endDate = endDate;
    this.frequency = frequency;
    this.type = type;
    this.serviceUrl = serviceUrl;
  }

  static create(props: {
    amount: number;
    description: string;
    billingDay: number;
    categoryId: string;
    userId: string;
    isActive?: boolean;
    startDate: Date;
    endDate?: Date | null;
    frequency?: BillingFrequency;
    type?: SubscriptionType;
    serviceUrl?: string | null;
    id?: string;
  }): Subscription {
    if (!props.amount || props.amount <= 0) {
      throw new ValidationException('Amount must be a positive number');
    }

    const trimmedDescription = props.description?.trim() ?? '';
    if (!trimmedDescription || trimmedDescription.length === 0) {
      throw new ValidationException('Description is required');
    }

    if (
      !props.billingDay ||
      props.billingDay < 1 ||
      props.billingDay > 31 ||
      !Number.isInteger(props.billingDay)
    ) {
      throw new ValidationException('Billing day must be an integer between 1 and 31');
    }

    const type = props.type ?? SubscriptionType.GENERAL;
    const serviceUrl = props.serviceUrl ?? null;
    const endDate = props.endDate ?? null;

    if (type === SubscriptionType.DIGITAL_SERVICE && !serviceUrl) {
      throw new ValidationException('Service URL is required for digital service subscriptions');
    }

    if (type === SubscriptionType.GENERAL && serviceUrl) {
      throw new ValidationException('Service URL is only allowed for digital service subscriptions');
    }

    if (serviceUrl && !serviceUrl.startsWith('http://') && !serviceUrl.startsWith('https://')) {
      throw new ValidationException('Service URL must be a valid URL');
    }

    if (endDate && endDate.getTime() <= props.startDate.getTime()) {
      throw new ValidationException('End date must be after start date');
    }

    return new Subscription(
      props.amount,
      trimmedDescription,
      props.billingDay,
      props.categoryId,
      props.userId,
      props.isActive ?? true,
      props.startDate,
      endDate,
      props.frequency ?? BillingFrequency.MONTHLY,
      type,
      serviceUrl,
      props.id,
    );
  }

  static clampBillingDay(billingDay: number, month: number, year: number): number {
    const lastDay = new Date(year, month, 0).getDate();
    return Math.min(billingDay, lastDay);
  }

  toggle(): void {
    this.isActive = !this.isActive;
  }
}
