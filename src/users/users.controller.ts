import { Body, Controller, Delete, Get, Put, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { IMAGE_MIMES } from '../storage/storage.service.js';
import { UsersService } from './users.service.js';
import { ChangePasswordDto, DeletePersonalImagesDto, UpdateMeDto } from './dto/user.dto.js';
import { BadRequestException } from '@nestjs/common';

const imageUpload = {
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req: unknown, f: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) =>
    IMAGE_MIMES.includes(f.mimetype) ? cb(null, true) : cb(new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF'), false),
};

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me') me(@CurrentUser() u: JwtUser) { return this.users.getMe(u.userId); }
  @Put('me') update(@CurrentUser() u: JwtUser, @Body() dto: UpdateMeDto) { return this.users.updateMe(u.userId, dto); }

  @Put('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', imageUpload))
  avatar(@CurrentUser() u: JwtUser, @UploadedFile() file?: Express.Multer.File) { return this.users.updateAvatar(u.userId, file); }

  @Put('me/change-password')
  changePassword(@CurrentUser() u: JwtUser, @Body() dto: ChangePasswordDto) { return this.users.changePassword(u.userId, dto); }

  @Get('me/personal-images') images(@CurrentUser() u: JwtUser) { return this.users.getPersonalImages(u.userId); }

  @Post('me/upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, imageUpload))
  upload(@CurrentUser() u: JwtUser, @UploadedFiles() files?: Express.Multer.File[]) { return this.users.addPersonalImages(u.userId, files); }

  @Delete('me/personal-images')
  removeImages(@CurrentUser() u: JwtUser, @Body() dto: DeletePersonalImagesDto) { return this.users.deletePersonalImages(u.userId, dto.urls); }
}
