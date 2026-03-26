import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { GetTransactionsFilterDto } from './dtos/get-transactions-filter.dto';
import { CreateTransactionCommand } from '../application/commands/create-transaction.command';
import { UpdateTransactionCommand } from '../application/commands/update-transaction.command';
import { DeleteTransactionCommand } from '../application/commands/delete-transaction.command';
import { GetTransactionsQuery } from '../application/queries/get-transactions.query';
import { GetSummaryQuery } from '../application/queries/get-summary.query';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('api/transactions')
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with optional month/year filter' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query() filter: GetTransactionsFilterDto,
  ) {
    return this.queryBus.execute(
      new GetTransactionsQuery(user.userId, filter.month, filter.year),
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get income/expense/balance summary for a month' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getSummary(
    @CurrentUser() user: { userId: string },
    @Query() filter: GetTransactionsFilterDto,
  ) {
    const now = new Date();
    const month = filter.month || now.getMonth() + 1;
    const year = filter.year || now.getFullYear();
    return this.queryBus.execute(
      new GetSummaryQuery(user.userId, month, year),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transaction' })
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        dto.amount,
        dto.description,
        new Date(dto.date),
        dto.categoryId,
        user.userId,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new UpdateTransactionCommand(
        id,
        dto.amount,
        dto.description,
        dto.date ? new Date(dto.date) : undefined,
        dto.categoryId,
        user.userId,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new DeleteTransactionCommand(id, user.userId),
    );
  }
}
