import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HASHING_SERVICE } from './application/ports/hashing.port';
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Global()
@Module({
  providers: [
    { provide: HASHING_SERVICE, useClass: BcryptHashingService },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [HASHING_SERVICE],
})
export class SharedModule {}
