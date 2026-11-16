import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { RemindersService } from './reminders.service.js';
import { SaveRemindersDto } from './dto/reminders.dto.js';

@ApiTags('reminders')
@UseGuards(JwtAuthGuard)
@Controller('invitations/:id/reminders')
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  list(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string) {
    return this.reminders.assertAndList(id, u.userId);
  }

  @Put()
  save(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: SaveRemindersDto) {
    return this.reminders.save(id, u.userId, dto);
  }
}
