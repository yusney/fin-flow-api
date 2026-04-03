import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfig, jwtConfig } from './config';
import mikroOrmConfig from './config/mikro-orm.config';
import { SharedModule } from './shared/shared.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SubscriptionTemplatesModule } from './modules/subscription-templates/subscription-templates.module';
import { UsersModule } from './modules/users/users.module';
import { DevDataSeeder } from './seeders/dev-data.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, jwtConfig] }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    SharedModule,
    PreferencesModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    SubscriptionsModule,
    SubscriptionTemplatesModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
    DevDataSeeder,
  ],
})
export class AppModule {}
