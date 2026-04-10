import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { GetSubscriptionPrefillQuery } from '../application/queries/get-subscription-prefill.query';
import { TemplateCategory } from '../domain/enums/template-category.enum';
import { PrefillResponseDto } from './dtos/prefill-response.dto';

@ApiTags('Subscription Templates')
@ApiBearerAuth()
@Controller('api/subscription-templates')
export class SubscriptionTemplatesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'List subscription templates' })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  async findAll(
    @Query('category') category?: TemplateCategory,
  ): Promise<unknown> {
    return this.queryBus.execute(new GetSubscriptionTemplatesQuery(category));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription template by id' })
  async findOne(@Param('id') id: string): Promise<unknown> {
    return this.queryBus.execute(new GetSubscriptionTemplateQuery(id));
  }

  @Get(':id/prefill')
  @ApiOperation({ summary: 'Get pre-fill data from a subscription template' })
  @ApiResponse({ status: 200, type: PrefillResponseDto })
  async prefill(@Param('id') id: string): Promise<PrefillResponseDto> {
    return this.queryBus.execute(new GetSubscriptionPrefillQuery(id));
  }
}
