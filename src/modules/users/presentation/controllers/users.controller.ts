import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { UpdateMeDto } from '../dtos/update-me.dto';
import { GetMeQuery } from '../../application/queries/get-me.query';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { UpdateMeCommand } from '../../application/commands/update-me.command';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: { userId: string }) {
    return this.queryBus.execute(new GetMeQuery(user.userId));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateMeDto) {
    return this.commandBus.execute(
      new UpdateMeCommand(
        user.userId,
        dto.name,
        dto.currentPassword,
        dto.newPassword,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public user info by ID' })
  getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
