import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { GuestsService } from './guests.service.js';
import {
  BulkCreateGuestsDto, BulkIdsDto, BulkSendEmailDto, BulkUpdateGuestsDto, CreateGuestDto, GroupDto, GuestsQueryDto,
  RsvpDto, SendEmailDto, UpdateGuestDto,
} from './dto/guest.dto.js';

const Id = () => Param('id', ParseObjectIdPipe);

/** Khách mời + nhóm của MỘT thiệp. Thứ tự khai báo quan trọng: các route "bulk-*" phải đứng trước ":guestId". */
@ApiTags('guests')
@UseGuards(JwtAuthGuard)
@Controller('invitations/:id')
export class InvitationGuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get('guests') list(@CurrentUser() u: JwtUser, @Id() id: string, @Query() q: GuestsQueryDto) { return this.guests.list(u.userId, id, q); }
  @Post('guests') add(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: CreateGuestDto) { return this.guests.create(u.userId, id, dto); }

  @Post('guests/bulk') bulkAdd(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: BulkCreateGuestsDto) { return this.guests.bulkCreate(u.userId, id, dto); }
  @Put('guests/bulk-update') bulkUpdate(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: BulkUpdateGuestsDto) { return this.guests.bulkUpdate(u.userId, id, dto); }
  @HttpCode(200) @Post('guests/bulk-delete') bulkDelete(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: BulkIdsDto) { return this.guests.bulkDelete(u.userId, id, dto.ids); }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post('guests/bulk-send-email')
  bulkSend(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: BulkSendEmailDto) { return this.guests.bulkSend(u.userId, id, dto); }

  @Put('guests/:guestId') updateGuest(@CurrentUser() u: JwtUser, @Id() id: string, @Param('guestId', ParseObjectIdPipe) gid: string, @Body() dto: UpdateGuestDto) { return this.guests.update(u.userId, id, gid, dto); }
  @Delete('guests/:guestId') removeGuest(@CurrentUser() u: JwtUser, @Id() id: string, @Param('guestId', ParseObjectIdPipe) gid: string) { return this.guests.remove(u.userId, id, gid); }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Put('guests/:guestId/send-email')
  sendOne(@CurrentUser() u: JwtUser, @Id() id: string, @Param('guestId', ParseObjectIdPipe) gid: string, @Body() dto: SendEmailDto) { return this.guests.sendOne(u.userId, id, gid, dto?.message); }

  @Get('guest-groups') groups(@CurrentUser() u: JwtUser, @Id() id: string) { return this.guests.listGroups(u.userId, id); }
  @Post('guest-groups') addGroup(@CurrentUser() u: JwtUser, @Id() id: string, @Body() dto: GroupDto) { return this.guests.createGroup(u.userId, id, dto); }
  @Put('guest-groups/:groupId') updateGroup(@CurrentUser() u: JwtUser, @Id() id: string, @Param('groupId', ParseObjectIdPipe) gid: string, @Body() dto: GroupDto) { return this.guests.updateGroup(u.userId, id, gid, dto); }
  @Delete('guest-groups/:groupId') removeGroup(@CurrentUser() u: JwtUser, @Id() id: string, @Param('groupId', ParseObjectIdPipe) gid: string) { return this.guests.removeGroup(u.userId, id, gid); }
}

/** Khách tự xác nhận tham dự — KHÔNG cần đăng nhập. `:guestId` ở đây là TOKEN trong link email (không phải _id Mongo). */
@ApiTags('guests')
@Controller('invitations/:id/guests')
export class PublicGuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Put(':guestId/rsvp')
  rsvp(@Param('id') id: string, @Param('guestId') token: string, @Body() dto: RsvpDto) { return this.guests.submitRsvp(id, token, dto); }
}

/** GET /master-guests — danh bạ khách mời của chủ thiệp (dùng cho "Thêm từ danh bạ"). */
@ApiTags('guests')
@UseGuards(JwtAuthGuard)
@Controller('master-guests')
export class MasterGuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get() list(@CurrentUser() u: JwtUser, @Query() q: PaginationQueryDto) { return this.guests.listMaster(u.userId, q); }
}
