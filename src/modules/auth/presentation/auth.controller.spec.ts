import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { LoginUserQuery } from '../application/queries/login-user.query';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('register', () => {
    it('should execute RegisterUserCommand and return { id }', async () => {
      const expectedResult = { id: 'user-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = await controller.register(dto);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new RegisterUserCommand('John Doe', 'john@example.com', 'password123'),
      );
    });
  });

  describe('login', () => {
    it('should execute LoginUserQuery and return { access_token }', async () => {
      const expectedResult = { access_token: 'jwt-token' };
      queryBus.execute.mockResolvedValue(expectedResult);

      const dto = { email: 'john@example.com', password: 'password123' };
      const result = await controller.login(dto);

      expect(result).toEqual(expectedResult);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new LoginUserQuery('john@example.com', 'password123'),
      );
    });
  });
});
