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
  ApiResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { GetSubscriptionPrefillQuery } from '../application/queries/get-subscription-prefill.query';
import { CreateSubscriptionTemplateCommand } from '../application/commands/create-subscription-template.command';
import { UpdateSubscriptionTemplateCommand } from '../application/commands/update-subscription-template.command';
import { DeleteSubscriptionTemplateCommand } from '../application/commands/delete-subscription-template.command';
import { TemplateCategory } from '../domain/enums/template-category.enum';
import { PrefillResponseDto } from './dtos/prefill-response.dto';
import { CreateSubscriptionTemplateDto } from './dtos/create-subscription-template.dto';
import { UpdateSubscriptionTemplateDto } from './dtos/update-subscription-template.dto';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';

interface AuthUser {
  userId: string;
  email: string;
}

@ApiTags('Subscription Templates')
@ApiBearerAuth()
@Controller('api/subscription-templates')
export class SubscriptionTemplatesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List subscription templates (global + user own)' })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('category') category?: TemplateCategory,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetSubscriptionTemplatesQuery(user.userId, category),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription template by id' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetSubscriptionTemplateQuery(id, user.userId),
    );
  }

  @Get(':id/prefill')
  @ApiOperation({ summary: 'Get pre-fill data from a subscription template' })
  @ApiResponse({ status: 200, type: PrefillResponseDto })
  async prefill(@Param('id') id: string): Promise<PrefillResponseDto> {
    return this.queryBus.execute(new GetSubscriptionPrefillQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a user-owned subscription template' })
  @ApiResponse({ status: 201 })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSubscriptionTemplateDto,
  ): Promise<unknown> {
    return this.commandBus.execute(
      new CreateSubscriptionTemplateCommand(
        user.userId,
        dto.name,
        dto.templateCategory,
        dto.description,
        dto.iconUrl,
        dto.serviceUrl,
        dto.defaultAmount,
        dto.defaultFrequency,
      ),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user-owned subscription template' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionTemplateDto,
  ): Promise<unknown> {
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
        dto.templateCategory,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user-owned subscription template' })
  @ApiResponse({ status: 204 })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteSubscriptionTemplateCommand(id, user.userId),
    );
  }
}
