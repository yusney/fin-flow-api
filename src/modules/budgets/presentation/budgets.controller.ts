import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { GetBudgetStatusFilterDto } from './dtos/get-budget-status-filter.dto';
import { CreateBudgetCommand } from '../application/commands/create-budget.command';
import { GetBudgetStatusQuery } from '../application/queries/get-budget-status.query';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('api/budgets')
export class BudgetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Set a budget limit for a category/month' })
  async create(
    @Body() dto: CreateBudgetDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new CreateBudgetCommand(
        dto.limitAmount,
        dto.month,
        dto.year,
        dto.categoryId,
        user.userId,
      ),
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'Get budget status with spent vs limit' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getStatus(
    @CurrentUser() user: { userId: string },
    @Query() filter: GetBudgetStatusFilterDto,
  ) {
    const now = new Date();
    return this.queryBus.execute(
      new GetBudgetStatusQuery(
        user.userId,
        filter.month || now.getMonth() + 1,
        filter.year || now.getFullYear(),
      ),
    );
  }
}
