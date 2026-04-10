import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';
import { CategoryType } from '../enums/category-type.enum';

export class Category extends BaseEntity {
  public name: string;
  public type: string;
  public userId: string;

  constructor(name: string, type: string, userId: string, id?: string) {
    super(id);
    this.name = name;
    this.type = type;
    this.userId = userId;
  }

  static create(props: {
    name: string;
    type: string;
    userId: string;
    id?: string;
  }): Category {
    const trimmedName = props.name?.trim() ?? '';

    if (!trimmedName || trimmedName.length === 0) {
      throw new ValidationException('Name is required');
    }

    if (trimmedName.length > 100) {
      throw new ValidationException('Name must not exceed 100 characters');
    }

    const validTypes = Object.values(CategoryType) as string[];
    if (!validTypes.includes(props.type)) {
      throw new ValidationException('Type must be either income or expense');
    }

    return new Category(trimmedName, props.type, props.userId, props.id);
  }
}
