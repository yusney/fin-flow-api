import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { CreateSubscriptionCommand } from '../application/commands/create-subscription.command';
import { ToggleSubscriptionCommand } from '../application/commands/toggle-subscription.command';
import { GetSubscriptionsQuery } from '../application/queries/get-subscriptions.query';
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
}
