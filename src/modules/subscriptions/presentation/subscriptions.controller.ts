import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from './dtos/update-subscription.dto';
import { CreateSubscriptionCommand } from '../application/commands/create-subscription.command';
import { ToggleSubscriptionCommand } from '../application/commands/toggle-subscription.command';
import { UpdateSubscriptionCommand } from '../application/commands/update-subscription.command';
import { GetSubscriptionsQuery } from '../application/queries/get-subscriptions.query';
import { GetSubscriptionHistoryQuery } from '../application/queries/get-subscription-history.query';
import { BillingFrequency } from '../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../domain/enums/subscription-type.enum';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(@CurrentUser() user: { userId: string }) {
    return this.queryBus.execute(new GetSubscriptionsQuery(user.userId));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a recurring expense' })
  async create(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new CreateSubscriptionCommand(
        dto.amount,
        dto.description,
        dto.billingDay,
        dto.categoryId,
        user.userId,
        new Date(dto.startDate),
        dto.endDate ? new Date(dto.endDate) : null,
        dto.frequency ?? BillingFrequency.MONTHLY,
        dto.type ?? SubscriptionType.GENERAL,
        dto.serviceUrl ?? null,
      ),
    );
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'Activate or pause a subscription' })
  async toggle(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new ToggleSubscriptionCommand(id, user.userId),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription (creates new version)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
    @CurrentUser() user: { userId: string },
  ) {
    const hasUpdate = Object.values(dto).some((v) => v !== undefined);
    if (!hasUpdate) {
      throw new BadRequestException('At least one field must be provided');
    }

    return this.commandBus.execute(
      new UpdateSubscriptionCommand(
        id,
        user.userId,
        dto.amount,
        dto.description,
        dto.billingDay,
        dto.frequency,
        dto.type,
        dto.serviceUrl,
      ),
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get subscription version history' })
  async getHistory(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.queryBus.execute(
      new GetSubscriptionHistoryQuery(id, user.userId),
    );
  }
}
