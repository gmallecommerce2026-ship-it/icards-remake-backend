import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { WishesService } from './wishes.service.js';
import { CreateWishDto, UpdateWishDto } from './dto/wish.dto.js';

@ApiTags('wishes')
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishes: WishesService) {}

  // ---- công khai (khách xem thiệp) — `eventId` là _id hoặc slug của thiệp
  @Get('public/:eventId') listPublic(@Param('eventId') eventId: string) { return this.wishes.listPublic(eventId); }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('public/:eventId')
  createPublic(@Param('eventId') eventId: string, @Body() dto: CreateWishDto) { return this.wishes.createPublic(eventId, dto); }

  // ---- chủ thiệp
  @UseGuards(JwtAuthGuard) @Get('admin/:invitationId')
  listAdmin(@CurrentUser() u: JwtUser, @Param('invitationId', ParseObjectIdPipe) id: string, @Query() q: PaginationQueryDto) { return this.wishes.listAdmin(u.userId, id, q); }

  @UseGuards(JwtAuthGuard) @Put(':wishId')
  update(@CurrentUser() u: JwtUser, @Param('wishId', ParseObjectIdPipe) id: string, @Body() dto: UpdateWishDto) { return this.wishes.update(u.userId, id, dto); }

  @UseGuards(JwtAuthGuard) @Delete(':wishId')
  remove(@CurrentUser() u: JwtUser, @Param('wishId', ParseObjectIdPipe) id: string) { return this.wishes.remove(u.userId, id); }
}
