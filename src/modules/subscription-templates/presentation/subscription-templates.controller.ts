import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { CreateSubscriptionTemplateDto } from './dtos/create-subscription-template.dto';
import { UpdateSubscriptionTemplateDto } from './dtos/update-subscription-template.dto';
import { CreateSubscriptionTemplateCommand } from '../application/commands/create-subscription-template.command';
import { UpdateSubscriptionTemplateCommand } from '../application/commands/update-subscription-template.command';
import { DeleteSubscriptionTemplateCommand } from '../application/commands/delete-subscription-template.command';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { TemplateCategory } from '../domain/enums/template-category.enum';

@ApiTags('Subscription Templates')
@ApiBearerAuth()
@Controller('api/subscription-templates')
export class SubscriptionTemplatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List subscription templates' })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('category') category?: TemplateCategory,
  ) {
    return this.queryBus.execute(
      new GetSubscriptionTemplatesQuery(user.userId, category),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription template by id' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.queryBus.execute(
      new GetSubscriptionTemplateQuery(user.userId, id),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a subscription template' })
  async create(
    @Body() dto: CreateSubscriptionTemplateDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new CreateSubscriptionTemplateCommand(
        dto.name,
        user.userId,
        dto.category,
        dto.defaultFrequency,
        dto.defaultAmount,
        dto.description ?? null,
        dto.iconUrl ?? null,
        dto.serviceUrl ?? null,
      ),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription template' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionTemplateDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new UpdateSubscriptionTemplateCommand(
        id,
        user.userId,
        dto.name,
        dto.description,
        dto.iconUrl,
        dto.serviceUrl,
        dto.defaultAmount,
        dto.defaultFrequency,
        dto.category,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subscription template' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new DeleteSubscriptionTemplateCommand(id, user.userId),
    );
  }
}
