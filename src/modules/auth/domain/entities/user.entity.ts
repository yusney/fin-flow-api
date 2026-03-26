import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

export class User extends BaseEntity {
  public name: string;
  public email: string;
  public passwordHash: string;

  constructor(
    name: string,
    email: string,
    passwordHash: string,
    id?: string,
  ) {
    super(id);
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static create(props: {
    name: string;
    email: string;
    passwordHash: string;
    id?: string;
  }): User {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationException('Name is required');
    }
    if (!props.email || !props.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new ValidationException('Invalid email format');
    }
    return new User(
      props.name.trim(),
      props.email.toLowerCase(),
      props.passwordHash,
      props.id,
    );
  }
}
