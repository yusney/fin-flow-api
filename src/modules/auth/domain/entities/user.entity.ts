import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

export interface UserJSON {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicInfo {
  id: string;
  name: string;
}

export class User extends BaseEntity {
  public name: string;
  public email: string;
  public passwordHash: string;

  constructor(name: string, email: string, passwordHash: string, id?: string) {
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

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Name is required');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  updatePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  toJSON(): UserJSON {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
