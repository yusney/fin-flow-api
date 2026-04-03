import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { USER_REPOSITORY } from './domain/ports/user.repository';
import { MikroOrmUserRepository } from './infrastructure/persistence/mikro-orm-user.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginUserHandler } from './application/queries/login-user.handler';
import { AuthController } from './presentation/auth.controller';
import { PreferencesModule } from '../preferences/preferences.module';

const CommandHandlers = [RegisterUserHandler];
const QueryHandlers = [LoginUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    PreferencesModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1h') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: USER_REPOSITORY, useClass: MikroOrmUserRepository },
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule, USER_REPOSITORY],
})
export class AuthModule {}
