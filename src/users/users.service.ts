import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, type UserDocument } from './schemas/user.schema.js';
import { StorageService } from '../storage/storage.service.js';
import type { ChangePasswordDto, UpdateMeDto } from './dto/user.dto.js';

export const toPublicUser = (u: UserDocument | (User & { _id: unknown })) => {
  const o = typeof (u as UserDocument).toObject === 'function' ? (u as UserDocument).toObject() : (u as User & { _id: unknown });
  return {
    _id: String(o._id),
    username: o.username,
    email: o.email,
    fullName: o.fullName,
    phone: o.phone,
    avatar: o.avatar,
    role: o.role,
    createdAt: (o as { createdAt?: Date }).createdAt,
  };
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) readonly model: Model<User>, private readonly storage: StorageService) {}

  async getMe(id: string) {
    const u = await this.model.findById(id);
    if (!u || !u.isActive) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(u);
  }

  async updateMe(id: string, dto: UpdateMeDto) {
    if (dto.email) {
      const dup = await this.model.exists({ email: dto.email.toLowerCase(), _id: { $ne: id } });
      if (dup) throw new ConflictException('Email đã được sử dụng');
    }
    const u = await this.model.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true });
    if (!u) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(u);
  }

  async updateAvatar(id: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "avatar")');
    const url = await this.storage.upload(file.buffer, file.mimetype, `avatars/${id}`);
    const old = await this.model.findByIdAndUpdate(id, { avatar: url }, { new: false });
    if (old?.avatar) void this.storage.removeByUrl(old.avatar);
    return { avatar: url };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const u = await this.model.findById(id).select('+password');
    if (!u?.password) throw new BadRequestException('Tài khoản đăng nhập bằng mạng xã hội, chưa có mật khẩu.');
    if (!(await bcrypt.compare(dto.currentPassword, u.password))) throw new BadRequestException('Mật khẩu hiện tại không đúng');
    u.password = await bcrypt.hash(dto.newPassword, 12);
    await u.save();
    return { message: 'Đã đổi mật khẩu' };
  }

  async getPersonalImages(id: string) {
    const u = await this.model.findById(id).select('personalImages').lean();
    return { images: u?.personalImages ?? [] };
  }

  async addPersonalImages(id: string, files: Express.Multer.File[] = []) {
    if (!files.length) throw new BadRequestException('Thiếu file ảnh (field "images")');
    const uploaded = await Promise.all(files.map((f) => this.storage.upload(f.buffer, f.mimetype, `users/${id}`)));
    const u = await this.model.findByIdAndUpdate(id, { $push: { personalImages: { $each: uploaded } } }, { new: true }).select('personalImages');
    return { uploaded, images: u?.personalImages ?? uploaded };
  }

  async deletePersonalImages(id: string, urls: string[]) {
    const u = await this.model.findById(id).select('personalImages');
    if (!u) throw new NotFoundException('Không tìm thấy người dùng');
    const owned = urls.filter((x) => u.personalImages.includes(x));
    u.personalImages = u.personalImages.filter((x) => !owned.includes(x));
    await u.save();
    await Promise.all(owned.map((x) => this.storage.removeByUrl(x)));
    return { images: u.personalImages };
  }
}
