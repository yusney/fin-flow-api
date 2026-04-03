import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

export class Budget extends BaseEntity {
  public limitAmount: number;
  public month: number;
  public year: number;
  public categoryId: string;
  public userId: string;

  constructor(
    limitAmount: number,
    month: number,
    year: number,
    categoryId: string,
    userId: string,
    id?: string,
  ) {
    super(id);
    this.limitAmount = limitAmount;
    this.month = month;
    this.year = year;
    this.categoryId = categoryId;
    this.userId = userId;
  }

  static create(props: {
    limitAmount: number;
    month: number;
    year: number;
    categoryId: string;
    userId: string;
    id?: string;
  }): Budget {
    if (!props.limitAmount || props.limitAmount <= 0) {
      throw new ValidationException('Limit amount must be a positive number');
    }

    if (!Number.isInteger(props.month) || props.month < 1 || props.month > 12) {
      throw new ValidationException('Month must be between 1 and 12');
    }

    if (!Number.isInteger(props.year) || props.year < 2000) {
      throw new ValidationException('Year must be 2000 or later');
    }

    return new Budget(
      props.limitAmount,
      props.month,
      props.year,
      props.categoryId,
      props.userId,
      props.id,
    );
  }

  toJSON() {
    return {
      id: this.id,
      limitAmount: this.limitAmount,
      month: this.month,
      year: this.year,
      categoryId: this.categoryId,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
