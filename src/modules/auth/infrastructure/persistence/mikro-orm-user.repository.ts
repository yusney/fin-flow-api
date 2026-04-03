import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IUserRepository } from '../../domain/ports/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class MikroOrmUserRepository implements IUserRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  persist(user: User): void {
    this.em.persist(user);
  }

  async save(user: User): Promise<void> {
    this.em.persist(user);
    await this.em.flush();
  }

  async update(user: User): Promise<void> {
    await this.em.flush();
  }
}
