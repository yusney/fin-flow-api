import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

export class Transaction extends BaseEntity {
  public amount: number;
  public description: string;
  public date: Date;
  public categoryId: string;
  public userId: string;

  constructor(
    amount: number,
    description: string,
    date: Date,
    categoryId: string,
    userId: string,
    id?: string,
  ) {
    super(id);
    this.amount = amount;
    this.description = description;
    this.date = date;
    this.categoryId = categoryId;
    this.userId = userId;
  }

  static create(props: {
    amount: number;
    description: string;
    date: Date;
    categoryId: string;
    userId: string;
    id?: string;
  }): Transaction {
    if (!props.amount || props.amount <= 0) {
      throw new ValidationException('Amount must be a positive number');
    }

    const trimmedDescription = props.description?.trim() ?? '';
    if (!trimmedDescription || trimmedDescription.length === 0) {
      throw new ValidationException('Description is required');
    }

    if (!props.categoryId?.trim()) {
      throw new ValidationException('Category ID is required');
    }

    return new Transaction(
      props.amount,
      trimmedDescription,
      props.date,
      props.categoryId,
      props.userId,
      props.id,
    );
  }
}
