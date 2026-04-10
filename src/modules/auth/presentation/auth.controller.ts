import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/infrastructure/decorators/public.decorator';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { LoginUserQuery } from '../application/queries/login-user.query';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto): Promise<unknown> {
    return this.commandBus.execute(
      new RegisterUserCommand(dto.name, dto.email, dto.password),
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Returns access_token' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<unknown> {
    return this.queryBus.execute(new LoginUserQuery(dto.email, dto.password));
  }
}
