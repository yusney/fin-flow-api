import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CreateCategoryCommand } from '../application/commands/create-category.command';
import { GetCategoriesQuery } from '../application/queries/get-categories.query';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('api/categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List user categories' })
  async findAll(@CurrentUser() user: { userId: string }) {
    return this.queryBus.execute(new GetCategoriesQuery(user.userId));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commandBus.execute(
      new CreateCategoryCommand(dto.name, dto.type, user.userId),
    );
  }
}
