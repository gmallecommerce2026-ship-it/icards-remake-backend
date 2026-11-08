import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
import { StorageService } from '../storage/storage.service.js';
import type { ChangePasswordDto, UpdateMeDto } from './dto/user.dto.js';

export const toPublicUser = (u: User) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  fullName: u.fullName,
  phone: u.phone,
  avatar: u.avatar,
  role: u.role,
  createdAt: u.createdAt,
});

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) readonly repo: Repository<User>,
    private readonly storage: StorageService,
  ) {}

  private async byId(id: string): Promise<User> {
    const u = await this.repo.findOne({ where: { _id: id } });
    if (!u) throw new NotFoundException('Không tìm thấy người dùng');
    return u;
  }

  async getMe(id: string) {
    const u = await this.byId(id);
    if (!u.isActive) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(u);
  }

  async updateMe(id: string, dto: UpdateMeDto) {
    const set: Partial<User> = {};
    if (dto.fullName !== undefined) set.fullName = dto.fullName;
    if (dto.phone !== undefined) set.phone = dto.phone;
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase();
      const dup = await this.repo.exists({ where: { email, _id: Not(id) } });
      if (dup) throw new ConflictException('Email đã được sử dụng');
      set.email = email;
    }
    if (Object.keys(set).length) await this.repo.update({ _id: id }, set);
    return toPublicUser(await this.byId(id));
  }

  async updateAvatar(id: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "avatar")');
    const url = await this.storage.upload(file.buffer, file.mimetype, `avatars/${id}`);
    const old = await this.byId(id);
    await this.repo.update({ _id: id }, { avatar: url });
    if (old.avatar) void this.storage.removeByUrl(old.avatar);
    return { avatar: url };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const u = await this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u._id = :id', { id })
      .getOne();
    if (!u?.password) throw new BadRequestException('Tài khoản đăng nhập bằng mạng xã hội, chưa có mật khẩu.');
    if (!(await bcrypt.compare(dto.currentPassword, u.password))) throw new BadRequestException('Mật khẩu hiện tại không đúng');
    await this.repo.update({ _id: id }, { password: await bcrypt.hash(dto.newPassword, 12) });
    return { message: 'Đã đổi mật khẩu' };
  }

  async getPersonalImages(id: string) {
    const u = await this.repo.findOne({ where: { _id: id } });
    return { images: u?.personalImages ?? [] };
  }

  async addPersonalImages(id: string, files: Express.Multer.File[] = []) {
    if (!files.length) throw new BadRequestException('Thiếu file ảnh (field "images")');
    const uploaded = await Promise.all(files.map((f) => this.storage.upload(f.buffer, f.mimetype, `users/${id}`)));
    const u = await this.byId(id);
    const images = [...(u.personalImages ?? []), ...uploaded];
    await this.repo.update({ _id: id }, { personalImages: images });
    return { uploaded, images };
  }

  async deletePersonalImages(id: string, urls: string[]) {
    const u = await this.byId(id);
    const current = u.personalImages ?? [];
    const owned = urls.filter((x) => current.includes(x));
    const images = current.filter((x) => !owned.includes(x));
    await this.repo.update({ _id: id }, { personalImages: images });
    await Promise.all(owned.map((x) => this.storage.removeByUrl(x)));
    return { images };
  }
}
