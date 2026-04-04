import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './presentation/controllers/users.controller';
import { GetMeHandler } from './application/queries/get-me.handler';
import { GetUserHandler } from './application/queries/get-user.handler';
import { UpdateMeHandler } from './application/commands/update-me.handler';

const QueryHandlers = [GetMeHandler, GetUserHandler];
const CommandHandlers = [UpdateMeHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [UsersController],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class UsersModule {}
