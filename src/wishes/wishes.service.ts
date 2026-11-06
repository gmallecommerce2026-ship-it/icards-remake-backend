import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wish } from './schemas/wish.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { CreateWishDto, UpdateWishDto } from './dto/wish.dto.js';

@Injectable()
export class WishesService {
  constructor(
    @InjectModel(Wish.name) private readonly wishes: Model<Wish>,
    @InjectModel(Guest.name) private readonly guests: Model<Guest>,
    private readonly invitations: InvitationsService,
  ) {}

  /** Công khai: chỉ lời chúc đã duyệt, không lộ thông tin khách. */
  async listPublic(eventId: string) {
    const inv = await this.invitations.findPublished(eventId);
    return this.wishes.find({ invitation: inv._id, isApproved: true }).select('name message createdAt').sort({ createdAt: -1 }).limit(200).lean();
  }

  async createPublic(eventId: string, dto: CreateWishDto) {
    const inv = await this.invitations.findPublished(eventId);
    if (!inv.settings.allowWishes) throw new ForbiddenException('Thiệp này đã tắt sổ lưu bút');
    const guest = dto.guestId ? await this.guests.findOne({ invitation: inv._id, token: dto.guestId }).select('_id').lean() : null;
    const w = await this.wishes.create({
      invitation: inv._id, guest: guest?._id ?? null, name: dto.name, message: dto.message, isApproved: !inv.settings.moderateWishes,
    });
    return { _id: w._id, name: w.name, message: w.message, createdAt: (w as unknown as { createdAt: Date }).createdAt, isApproved: w.isApproved };
  }

  async listAdmin(userId: string, invitationId: string, q: PaginationQueryDto) {
    await this.invitations.assertOwner(invitationId, userId);
    const f = { invitation: new Types.ObjectId(invitationId) };
    const [items, total, pending] = await Promise.all([
      this.wishes.find(f).populate('guest', 'name email').sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      this.wishes.countDocuments(f),
      this.wishes.countDocuments({ ...f, isApproved: false }),
    ]);
    return { items, total, pending, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) };
  }

  private async ownedWish(userId: string, wishId: string) {
    const w = await this.wishes.findById(wishId);
    if (!w) throw new NotFoundException('Không tìm thấy lời chúc');
    await this.invitations.assertOwner(String(w.invitation), userId); // 404 nếu không phải chủ thiệp
    return w;
  }

  async update(userId: string, wishId: string, dto: UpdateWishDto) {
    const w = await this.ownedWish(userId, wishId);
    if (dto.isApproved !== undefined) w.isApproved = dto.isApproved;
    if (dto.message !== undefined) w.message = dto.message;
    return w.save();
  }

  async remove(userId: string, wishId: string) {
    const w = await this.ownedWish(userId, wishId);
    await w.deleteOne();
    return { message: 'Đã xoá lời chúc' };
  }
}
