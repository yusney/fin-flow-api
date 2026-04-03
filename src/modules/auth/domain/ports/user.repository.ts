import { User } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  persist(user: User): void;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
