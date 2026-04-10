import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

// Entities
import { User } from '../modules/auth/domain/entities/user.entity';
import { Category } from '../modules/categories/domain/entities/category.entity';
import { CategoryType } from '../modules/categories/domain/enums/category-type.enum';
import { Transaction } from '../modules/transactions/domain/entities/transaction.entity';
import { Budget } from '../modules/budgets/domain/entities/budget.entity';
import { Subscription } from '../modules/subscriptions/domain/entities/subscription.entity';
import { BillingFrequency } from '../modules/subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../modules/subscriptions/domain/enums/subscription-type.enum';

@Injectable()
export class DevDataSeeder implements OnModuleInit {
  private readonly logger = new Logger(DevDataSeeder.name);

  constructor(private readonly em: EntityManager) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    this.logger.log('Starting dev data seeding...');

    // Check if data already exists
    const existingUser = await this.em.findOne(User, {
      email: 'demo@finflow.com',
    });
    if (existingUser) {
      this.logger.log('Dev data already exists, skipping seed');
      return;
    }

    // Create demo user
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash('demo123', 10);

    const user = new User(
      'Demo User',
      'demo@finflow.com',
      passwordHash,
      userId,
    );
    this.em.persist(user);

    // Create second test user
    const user2Id = randomUUID();
    const user2 = new User(
      'Juan Pérez',
      'juan@finflow.com',
      passwordHash,
      user2Id,
    );
    this.em.persist(user2);

    await this.em.flush();

    // ==================== CATEGORIES ====================
    const categories = this.createCategories(userId, user2Id);
    for (const cat of categories) {
      this.em.persist(cat);
    }
    await this.em.flush();

    // Map categories by name for easy access
    const user1Categories = this.mapCategoriesByName(categories, userId);
    const user2Categories = this.mapCategoriesByName(categories, user2Id);

    // ==================== TRANSACTIONS ====================
    const transactions = this.createTransactions(
      userId,
      user1Categories,
      user2Id,
      user2Categories,
    );
    for (const tx of transactions) {
      this.em.persist(tx);
    }
    await this.em.flush();

    // ==================== BUDGETS ====================
    const budgets = this.createBudgets(userId, user1Categories);
    for (const budget of budgets) {
      this.em.persist(budget);
    }
    await this.em.flush();

    // ==================== SUBSCRIPTIONS ====================
    const subscriptions = this.createSubscriptions(userId, user1Categories);
    for (const sub of subscriptions) {
      this.em.persist(sub);
    }
    await this.em.flush();

    this.logger.log('Dev data seeding completed!');
    this.logger.log(
      'Created: 2 users, 16 categories, 30+ transactions, 5 budgets, 4 subscriptions',
    );
    this.logger.log('Demo credentials: demo@finflow.com / demo123');
  }

  private createCategories(userId: string, user2Id: string): Category[] {
    const categories: Category[] = [];

    // User 1 categories - Income
    categories.push(new Category('Salario', CategoryType.INCOME, userId));
    categories.push(new Category('Freelance', CategoryType.INCOME, userId));
    categories.push(new Category('Inversiones', CategoryType.INCOME, userId));

    // User 1 categories - Expense
    categories.push(new Category('🏠 Vivienda', CategoryType.EXPENSE, userId));
    categories.push(new Category('🍔 Comida', CategoryType.EXPENSE, userId));
    categories.push(
      new Category('🚗 Transporte', CategoryType.EXPENSE, userId),
    );
    categories.push(
      new Category('🎬 Entretenimiento', CategoryType.EXPENSE, userId),
    );
    categories.push(new Category('💊 Salud', CategoryType.EXPENSE, userId));
    categories.push(
      new Category('🛒 Supermercado', CategoryType.EXPENSE, userId),
    );
    categories.push(new Category('👕 Ropa', CategoryType.EXPENSE, userId));
    categories.push(new Category('📱 Telefono', CategoryType.EXPENSE, userId));
    categories.push(new Category('💡 Servicios', CategoryType.EXPENSE, userId));
    categories.push(new Category('🎮 Juegos', CategoryType.EXPENSE, userId));

    // User 2 categories - Income
    categories.push(new Category('Salario', CategoryType.INCOME, user2Id));
    categories.push(new Category('Negocios', CategoryType.INCOME, user2Id));

    // User 2 categories - Expense
    categories.push(new Category('Comida', CategoryType.EXPENSE, user2Id));
    categories.push(new Category('Transporte', CategoryType.EXPENSE, user2Id));
    categories.push(
      new Category('Entretenimiento', CategoryType.EXPENSE, user2Id),
    );

    return categories;
  }

  private mapCategoriesByName(
    categories: Category[],
    userId: string,
  ): Record<string, Category> {
    return categories
      .filter((c) => c.userId === userId)
      .reduce(
        (acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        },
        {} as Record<string, Category>,
      );
  }

  private createTransactions(
    userId: string,
    userCats: Record<string, Category>,
    user2Id: string,
    user2Cats: Record<string, Category>,
  ): Transaction[] {
    const transactions: Transaction[] = [];

    // User 1 transactions - Current month (March 2026)
    transactions.push(
      new Transaction(
        5000,
        'Salario mensual',
        new Date(2026, 2, 1),
        userCats['Salario'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        850,
        'Proyecto freelance',
        new Date(2026, 2, 15),
        userCats['Freelance'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        150,
        'Dividendos inversiones',
        new Date(2026, 2, 20),
        userCats['Inversiones'].id,
        userId,
      ),
    );

    // Expense transactions - Comida
    transactions.push(
      new Transaction(
        45.5,
        'almuerzo oficina',
        new Date(2026, 2, 2),
        userCats['🍔 Comida'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        28.0,
        'café con colega',
        new Date(2026, 2, 3),
        userCats['🍔 Comida'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        62.3,
        'almuerzo',
        new Date(2026, 2, 5),
        userCats['🍔 Comida'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        35.0,
        'cena rápida',
        new Date(2026, 2, 6),
        userCats['🍔 Comida'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        120.0,
        'restaurant anniversary',
        new Date(2026, 2, 14),
        userCats['🍔 Comida'].id,
        userId,
      ),
    );

    // Expense transactions - Supermercado
    transactions.push(
      new Transaction(
        185.5,
        'compra semanal',
        new Date(2026, 2, 1),
        userCats['🛒 Supermercado'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        92.3,
        'compra semana 2',
        new Date(2026, 2, 8),
        userCats['🛒 Supermercado'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        145.0,
        'compra quincena',
        new Date(2026, 2, 15),
        userCats['🛒 Supermercado'].id,
        userId,
      ),
    );

    // Expense transactions - Transporte
    transactions.push(
      new Transaction(
        45.0,
        'nafta',
        new Date(2026, 2, 3),
        userCats['🚗 Transporte'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        12.5,
        'estacionamiento',
        new Date(2026, 2, 4),
        userCats['🚗 Transporte'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        8.5,
        'peaje',
        new Date(2026, 2, 5),
        userCats['🚗 Transporte'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        55.0,
        'mantenimiento auto',
        new Date(2026, 2, 10),
        userCats['🚗 Transporte'].id,
        userId,
      ),
    );

    // Expense transactions - Entretenimiento
    transactions.push(
      new Transaction(
        15.99,
        'Netflix',
        new Date(2026, 2, 5),
        userCats['🎬 Entretenimiento'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        25.0,
        'cine',
        new Date(2026, 2, 12),
        userCats['🎬 Entretenimiento'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        12.99,
        'Spotify',
        new Date(2026, 2, 8),
        userCats['🎬 Entretenimiento'].id,
        userId,
      ),
    );

    // Expense transactions - Vivienda
    transactions.push(
      new Transaction(
        1200,
        'alquiler',
        new Date(2026, 2, 1),
        userCats['🏠 Vivienda'].id,
        userId,
      ),
    );

    // Expense transactions - Salud
    transactions.push(
      new Transaction(
        35.0,
        'farmacia',
        new Date(2026, 2, 7),
        userCats['💊 Salud'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        80.0,
        'consulta médico',
        new Date(2026, 2, 18),
        userCats['💊 Salud'].id,
        userId,
      ),
    );

    // Expense transactions - Telefono
    transactions.push(
      new Transaction(
        25.0,
        'celular',
        new Date(2026, 2, 10),
        userCats['📱 Telefono'].id,
        userId,
      ),
    );

    // Expense transactions - Servicios
    transactions.push(
      new Transaction(
        65.0,
        'luz',
        new Date(2026, 2, 12),
        userCats['💡 Servicios'].id,
        userId,
      ),
    );
    transactions.push(
      new Transaction(
        45.0,
        'internet',
        new Date(2026, 2, 5),
        userCats['💡 Servicios'].id,
        userId,
      ),
    );

    // Expense transactions - Ropa
    transactions.push(
      new Transaction(
        150.0,
        'remera y jeans',
        new Date(2026, 2, 22),
        userCats['👕 Ropa'].id,
        userId,
      ),
    );

    // Expense transactions - Juegos
    transactions.push(
      new Transaction(
        59.99,
        'nuevo juego',
        new Date(2026, 2, 25),
        userCats['🎮 Juegos'].id,
        userId,
      ),
    );

    // User 2 transactions (Juan Pérez)
    transactions.push(
      new Transaction(
        3500,
        'Salario',
        new Date(2026, 2, 1),
        user2Cats['Salario'].id,
        user2Id,
      ),
    );
    transactions.push(
      new Transaction(
        500,
        'Ganancia negocio',
        new Date(2026, 2, 10),
        user2Cats['Negocios'].id,
        user2Id,
      ),
    );
    transactions.push(
      new Transaction(
        200,
        'comida',
        new Date(2026, 2, 5),
        user2Cats['Comida'].id,
        user2Id,
      ),
    );
    transactions.push(
      new Transaction(
        50,
        'transporte',
        new Date(2026, 2, 3),
        user2Cats['Transporte'].id,
        user2Id,
      ),
    );
    transactions.push(
      new Transaction(
        30,
        'cine',
        new Date(2026, 2, 14),
        user2Cats['Entretenimiento'].id,
        user2Id,
      ),
    );

    return transactions;
  }

  private createBudgets(
    userId: string,
    categories: Record<string, Category>,
  ): Budget[] {
    const budgets: Budget[] = [];

    // March 2026 budgets
    budgets.push(new Budget(500, 3, 2026, categories['🍔 Comida'].id, userId));
    budgets.push(
      new Budget(200, 3, 2026, categories['🛒 Supermercado'].id, userId),
    );
    budgets.push(
      new Budget(150, 3, 2026, categories['🚗 Transporte'].id, userId),
    );
    budgets.push(
      new Budget(100, 3, 2026, categories['🎬 Entretenimiento'].id, userId),
    );
    budgets.push(new Budget(80, 3, 2026, categories['💊 Salud'].id, userId));

    return budgets;
  }

  private createSubscriptions(
    userId: string,
    categories: Record<string, Category>,
  ): Subscription[] {
    const subscriptions: Subscription[] = [];
    const startDate = new Date(2026, 0, 1); // January 2026

    subscriptions.push(
      new Subscription(
        15.99,
        'Netflix',
        5,
        categories['🎬 Entretenimiento'].id,
        userId,
        true,
        startDate,
        null,
        BillingFrequency.MONTHLY,
        SubscriptionType.DIGITAL_SERVICE,
        'https://www.netflix.com',
      ),
    );

    subscriptions.push(
      new Subscription(
        12.99,
        'Spotify Premium',
        8,
        categories['🎬 Entretenimiento'].id,
        userId,
        true,
        startDate,
        null,
        BillingFrequency.MONTHLY,
        SubscriptionType.DIGITAL_SERVICE,
        'https://www.spotify.com',
      ),
    );

    subscriptions.push(
      new Subscription(
        9.99,
        'Cloud Google One',
        15,
        categories['📱 Telefono'].id,
        userId,
        true,
        startDate,
        null,
        BillingFrequency.MONTHLY,
        SubscriptionType.DIGITAL_SERVICE,
        'https://one.google.com',
      ),
    );

    subscriptions.push(
      new Subscription(
        25.0,
        'Gimnasio',
        1,
        categories['💊 Salud'].id,
        userId,
        true,
        startDate,
        null,
        BillingFrequency.MONTHLY,
        SubscriptionType.GENERAL,
        null,
      ),
    );

    return subscriptions;
  }
}
