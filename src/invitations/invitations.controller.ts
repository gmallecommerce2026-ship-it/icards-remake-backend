import {
  BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { IMAGE_MIMES } from '../storage/storage.service.js';
import { InvitationsService } from './invitations.service.js';
import { BudgetDto, CreateInvitationDto, PublishDto, UpdateInvitationDto, UpdateSettingsDto, UpdateTasksDto } from './dto/invitation.dto.js';

/** multipart: file "cover" (≤5MB) + các field JSON dạng string (≤15MB/field vì có thể chứa ảnh base64). */
const coverUpload = {
  limits: { fileSize: 5 * 1024 * 1024, fieldSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req: unknown, f: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) =>
    IMAGE_MIMES.includes(f.mimetype) ? cb(null, true) : cb(new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF'), false),
};

/** GET /invitations/public/:id?guestId=<token>  — không cần đăng nhập. Phải khai báo TRƯỚC InvitationsController. */
@ApiTags('invitations')
@Controller('invitations/public')
export class PublicInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get(':id')
  get(@Param('id') id: string, @Query('guestId') guestId?: string) {
    return this.invitations.getPublic(id, guestId);
  }
}

@ApiTags('invitations')
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get() list(@CurrentUser() u: JwtUser) { return this.invitations.list(u.userId); }

  @Post()
  @UseInterceptors(FileInterceptor('cover', coverUpload))
  create(@CurrentUser() u: JwtUser, @Body() dto: CreateInvitationDto, @UploadedFile() cover?: Express.Multer.File) {
    return this.invitations.create(u.userId, dto, cover);
  }

  @Get(':id') get(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string) { return this.invitations.get(id, u.userId); }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover', coverUpload))
  update(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateInvitationDto, @UploadedFile() cover?: Express.Multer.File) {
    return this.invitations.update(id, u.userId, dto, cover);
  }

  @Delete(':id') remove(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string) { return this.invitations.remove(id, u.userId); }

  @Put(':id/publish')
  publish(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: PublishDto) {
    return this.invitations.setPublished(id, u.userId, dto.published);
  }

  @Put(':id/settings')
  settings(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateSettingsDto) {
    return this.invitations.updateSettings(id, u.userId, dto);
  }

  @Put(':id/budgetRequest')
  budget(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: BudgetDto) {
    return this.invitations.updateBudget(id, u.userId, dto);
  }

  @Get(':id/tasks') tasks(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string) { return this.invitations.getTasks(id, u.userId); }

  @Put(':id/tasks')
  updateTasks(@CurrentUser() u: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTasksDto) {
    return this.invitations.updateTasks(id, u.userId, dto);
  }
}
