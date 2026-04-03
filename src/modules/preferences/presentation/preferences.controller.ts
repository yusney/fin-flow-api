import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/infrastructure/decorators/current-user.decorator';
import { GetPreferencesQuery } from '../application/queries/get-preferences.query';
import { UpdatePreferencesCommand } from '../application/commands/update-preferences.command';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';

@ApiTags('Preferences')
@ApiBearerAuth()
@Controller('api/preferences')
export class PreferencesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPreferences(@CurrentUser() user: { userId: string }) {
    return this.queryBus.execute(new GetPreferencesQuery(user.userId));
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, description: 'Updated preferences' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePreferences(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.commandBus.execute(new UpdatePreferencesCommand(user.userId, dto));
  }
}
