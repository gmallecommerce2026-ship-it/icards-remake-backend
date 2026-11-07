import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Wish } from './schemas/wish.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { CreateWishDto, UpdateWishDto } from './dto/wish.dto.js';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishes: Repository<Wish>,
    @InjectRepository(Guest) private readonly guests: Repository<Guest>,
    private readonly invitations: InvitationsService,
  ) {}

  /** Công khai: chỉ lời chúc đã duyệt, không lộ thông tin khách. */
  async listPublic(eventId: string) {
    const inv = await this.invitations.findPublished(eventId);
    return this.wishes.find({
      where: { invitation: inv._id, isApproved: true },
      select: ['_id', 'name', 'message', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async createPublic(eventId: string, dto: CreateWishDto) {
    const inv = await this.invitations.findPublished(eventId);
    if (!inv.settings.allowWishes) throw new ForbiddenException('Thiệp này đã tắt sổ lưu bút');
    const guest = dto.guestId
      ? await this.guests.findOne({ where: { invitation: inv._id, token: dto.guestId }, select: ['_id'] })
      : null;
    const w = await this.wishes.save(this.wishes.create({
      invitation: inv._id,
      guest: guest?._id ?? null,
      name: dto.name,
      message: dto.message,
      isApproved: !inv.settings.moderateWishes,
    }));
    return { _id: w._id, name: w.name, message: w.message, createdAt: w.createdAt, isApproved: w.isApproved };
  }

  /** Gắn thông tin khách (name, email) vào lời chúc, giống populate('guest', 'name email'). */
  private async withGuest(list: Wish[]) {
    const ids = [...new Set(list.map((w) => w.guest).filter((x): x is string => !!x))];
    const map = new Map<string, { _id: string; name: string; email?: string | null }>();
    if (ids.length) {
      const gs = await this.guests.find({ where: { _id: In(ids) }, select: ['_id', 'name', 'email'] });
      for (const g of gs) map.set(g._id, { _id: g._id, name: g.name, email: g.email });
    }
    return list.map(({ guest, ...rest }) => ({ ...rest, guest: guest ? map.get(guest) ?? null : null }));
  }

  async listAdmin(userId: string, invitationId: string, q: PaginationQueryDto) {
    await this.invitations.assertOwner(invitationId, userId);
    const where = { invitation: invitationId };
    const [rows, total, pending] = await Promise.all([
      this.wishes.find({ where, order: { createdAt: 'DESC' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      this.wishes.count({ where }),
      this.wishes.count({ where: { ...where, isApproved: false } }),
    ]);
    const items = await this.withGuest(rows);
    return { items, total, pending, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) };
  }

  private async ownedWish(userId: string, wishId: string): Promise<Wish> {
    const w = await this.wishes.findOne({ where: { _id: wishId } });
    if (!w) throw new NotFoundException('Không tìm thấy lời chúc');
    await this.invitations.assertOwner(w.invitation, userId); // 404 nếu không phải chủ thiệp
    return w;
  }

  async update(userId: string, wishId: string, dto: UpdateWishDto) {
    const w = await this.ownedWish(userId, wishId);
    if (dto.isApproved !== undefined) w.isApproved = dto.isApproved;
    if (dto.message !== undefined) w.message = dto.message;
    return this.wishes.save(w);
  }

  async remove(userId: string, wishId: string) {
    const w = await this.ownedWish(userId, wishId);
    await this.wishes.delete({ _id: w._id });
    return { message: 'Đã xoá lời chúc' };
  }
}
