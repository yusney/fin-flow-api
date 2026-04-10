import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_PREFERENCES_REPOSITORY } from './domain/ports/user-preferences.repository';
import { MikroOrmUserPreferencesRepository } from './infrastructure/persistence/mikro-orm-user-preferences.repository';
import { GetPreferencesHandler } from './application/queries/get-preferences.handler';
import { UpdatePreferencesHandler } from './application/commands/update-preferences.handler';
import { PreferencesController } from './presentation/preferences.controller';

const QueryHandlers = [GetPreferencesHandler];
const CommandHandlers = [UpdatePreferencesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PreferencesController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    {
      provide: USER_PREFERENCES_REPOSITORY,
      useClass: MikroOrmUserPreferencesRepository,
    },
  ],
  exports: [USER_PREFERENCES_REPOSITORY],
})
export class PreferencesModule {}
