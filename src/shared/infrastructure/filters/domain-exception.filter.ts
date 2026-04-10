import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  DomainException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ValidationException,
} from '../../domain/exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof ForbiddenException) status = HttpStatus.FORBIDDEN;
    else if (exception instanceof NotFoundException)
      status = HttpStatus.NOT_FOUND;
    else if (exception instanceof ConflictException)
      status = HttpStatus.CONFLICT;
    else if (exception instanceof ValidationException)
      status = HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.constructor.name,
    });
  }
}
