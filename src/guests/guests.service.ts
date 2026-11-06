import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Guest, type GuestDocument } from './schemas/guest.schema.js';
import { GuestGroup } from './schemas/guest-group.schema.js';
import { MasterGuest } from './schemas/master-guest.schema.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import type { InvitationDocument } from '../invitations/schemas/invitation.schema.js';
import { MailService } from '../mail/mail.service.js';
import { randomToken } from '../common/utils/slug.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type {
  BulkCreateGuestsDto, BulkSendEmailDto, BulkUpdateGuestsDto, CreateGuestDto, GroupDto, GuestsQueryDto, RsvpDto, UpdateGuestDto,
} from './dto/guest.dto.js';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MAX_BULK_EMAIL = 300;
const EMAIL_CONCURRENCY = 5;

@Injectable()
export class GuestsService {
  constructor(
    @InjectModel(Guest.name) private readonly guests: Model<Guest>,
    @InjectModel(GuestGroup.name) private readonly groups: Model<GuestGroup>,
    @InjectModel(MasterGuest.name) private readonly master: Model<MasterGuest>,
    private readonly invitations: InvitationsService,
    private readonly mail: MailService,
    private readonly cfg: ConfigService,
  ) {}

  // ---------------------------------------------------------------- helpers
  private async resolveGroup(invId: string, dto: { groupId?: string | null; group?: string }): Promise<Types.ObjectId | null | undefined> {
    if (dto.groupId === null) return null;
    if (dto.groupId) {
      if (!(await this.groups.exists({ _id: dto.groupId, invitation: invId }))) throw new BadRequestException('Nhóm khách mời không tồn tại');
      return new Types.ObjectId(dto.groupId);
    }
    if (dto.group) {
      const g = await this.groups.findOneAndUpdate(
        { invitation: invId, name: dto.group }, { $setOnInsert: { invitation: invId, name: dto.group } }, { upsert: true, new: true },
      );
      return g._id;
    }
    return undefined;
  }

  /** Lưu vào danh bạ (best-effort, lỗi bỏ qua) */
  private async remember(owner: string, g: { name: string; email?: string; phone?: string }, groupName?: string) {
    const key = g.email ? { email: g.email.toLowerCase() } : g.phone ? { phone: g.phone } : null;
    if (!key) return;
    const $set: Record<string, unknown> = { name: g.name };
    if (g.phone) $set.phone = g.phone;
    if (groupName) $set.groupName = groupName;
    try {
      await this.master.updateOne({ owner, ...key }, { $set }, { upsert: true });
    } catch { /* trùng khoá chéo email/phone: bỏ qua */ }
  }

  publicLink(inv: InvitationDocument, guestToken: string): string {
    const base = (this.cfg.get<string>('FRONTEND_URL') ?? '').split(',')[0].trim().replace(/\/+$/, '');
    const path = this.cfg.get<string>('PUBLIC_EVENT_PATH') ?? '/events/view';
    return `${base}${path}?${new URLSearchParams({ id: inv.slug, guestId: guestToken })}`;
  }

  private async findGuest(invId: string, guestId: string) {
    const g = await this.guests.findOne({ _id: guestId, invitation: invId });
    if (!g) throw new NotFoundException('Không tìm thấy khách mời');
    return g;
  }

  // ---------------------------------------------------------------- guests CRUD
  async list(userId: string, invId: string, q: GuestsQueryDto) {
    await this.invitations.assertOwner(invId, userId);
    const f: Record<string, unknown> = { invitation: new Types.ObjectId(invId) };
    if (q.groupId) f.group = new Types.ObjectId(q.groupId);
    if (q.status) f.status = q.status === 'not-attending' ? 'declined' : q.status;
    if (q.emailStatus) f.emailStatus = q.emailStatus;
    if (q.search) { const r = new RegExp(esc(q.search.trim()), 'i'); f.$or = [{ name: r }, { email: r }, { phone: r }]; }
    const [items, total, stats] = await Promise.all([
      this.guests.find(f).populate('group', 'name color').sort({ createdAt: 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      this.guests.countDocuments(f),
      this.invitations.getStats(invId),
    ]);
    return { items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit), stats };
  }

  async create(userId: string, invId: string, dto: CreateGuestDto) {
    await this.invitations.assertOwner(invId, userId);
    if (dto.email && (await this.guests.exists({ invitation: invId, email: dto.email.toLowerCase() }))) {
      throw new ConflictException('Email này đã có trong danh sách khách mời');
    }
    const group = await this.resolveGroup(invId, dto);
    const g = await this.guests.create({
      invitation: invId, owner: userId, name: dto.name, email: dto.email, phone: dto.phone, group: group ?? null,
      companions: dto.companions ?? 0, giftAmount: dto.giftAmount ?? 0, note: dto.note, token: randomToken(),
    });
    await this.remember(userId, dto, dto.group);
    return g.populate('group', 'name color');
  }

  async bulkCreate(userId: string, invId: string, dto: BulkCreateGuestsDto) {
    await this.invitations.assertOwner(invId, userId);
    const existing = new Set((await this.guests.find({ invitation: invId, email: { $exists: true } }).select('email').lean()).map((g) => g.email));
    const skipped: { index: number; name: string; reason: string }[] = [];
    const docs: Partial<Guest>[] = [];
    const groupCache = new Map<string, Types.ObjectId | null | undefined>();
    for (const [index, g] of dto.guests.entries()) {
      const email = g.email?.toLowerCase();
      if (email && existing.has(email)) { skipped.push({ index, name: g.name, reason: 'Email đã tồn tại' }); continue; }
      if (email) existing.add(email);
      const key = `${g.groupId ?? ''}|${g.group ?? ''}`;
      if (!groupCache.has(key)) groupCache.set(key, await this.resolveGroup(invId, g));
      docs.push({
        invitation: new Types.ObjectId(invId), owner: new Types.ObjectId(userId), name: g.name, email, phone: g.phone,
        group: groupCache.get(key) ?? null, companions: g.companions ?? 0, giftAmount: g.giftAmount ?? 0, note: g.note, token: randomToken(),
      });
    }
    const created = docs.length ? await this.guests.insertMany(docs as Guest[]) : [];
    await Promise.all(dto.guests.map((g) => this.remember(userId, g, g.group)));
    return { created: created.length, skipped, guests: created };
  }

  async update(userId: string, invId: string, guestId: string, dto: UpdateGuestDto) {
    await this.invitations.assertOwner(invId, userId);
    const g = await this.findGuest(invId, guestId);
    if (dto.email && dto.email.toLowerCase() !== g.email
      && (await this.guests.exists({ invitation: invId, email: dto.email.toLowerCase(), _id: { $ne: g._id } }))) {
      throw new ConflictException('Email này đã có trong danh sách khách mời');
    }
    const group = await this.resolveGroup(invId, dto);
    for (const k of ['name', 'email', 'phone', 'companions', 'giftAmount', 'note'] as const) {
      if (dto[k] !== undefined) (g as unknown as Record<string, unknown>)[k] = dto[k];
    }
    if (group !== undefined) g.group = group;
    if (dto.status) { g.status = dto.status; g.respondedAt = dto.status === 'pending' ? undefined : new Date(); }
    await g.save();
    return g.populate('group', 'name color');
  }

  async remove(userId: string, invId: string, guestId: string) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.guests.deleteOne({ _id: guestId, invitation: invId });
    if (!r.deletedCount) throw new NotFoundException('Không tìm thấy khách mời');
    return { message: 'Đã xoá khách mời' };
  }

  async bulkUpdate(userId: string, invId: string, dto: BulkUpdateGuestsDto) {
    await this.invitations.assertOwner(invId, userId);
    const u = dto.update;
    const $set: Record<string, unknown> = {};
    if (u.groupId !== undefined) $set.group = (await this.resolveGroup(invId, { groupId: u.groupId })) ?? null;
    if (u.status) { $set.status = u.status; $set.respondedAt = u.status === 'pending' ? null : new Date(); }
    if (u.companions !== undefined) $set.companions = u.companions;
    if (u.giftAmount !== undefined) $set.giftAmount = u.giftAmount;
    if (!Object.keys($set).length) throw new BadRequestException('Không có trường nào để cập nhật');
    const r = await this.guests.updateMany({ _id: { $in: dto.ids }, invitation: invId }, { $set });
    return { matched: r.matchedCount, modified: r.modifiedCount };
  }

  async bulkDelete(userId: string, invId: string, ids: string[]) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.guests.deleteMany({ _id: { $in: ids }, invitation: invId });
    return { deleted: r.deletedCount };
  }

  // ---------------------------------------------------------------- email
  private async deliver(inv: InvitationDocument, g: GuestDocument, message?: string): Promise<{ ok: boolean; error?: string }> {
    const info = inv.info as Record<string, string | undefined>;
    try {
      await this.mail.sendInvitation({
        to: g.email!, guestName: g.name, title: inv.title, hostName: info.host, message,
        eventDate: [info.date, info.time].filter(Boolean).join(' · ') || (inv.eventDate ? inv.eventDate.toLocaleDateString('vi-VN') : undefined),
        venue: [info.venue, info.address].filter(Boolean).join(' - ') || undefined,
        link: this.publicLink(inv, g.token),
      });
      g.emailStatus = 'sent'; g.emailSentAt = new Date(); g.emailError = undefined;
      return { ok: true };
    } catch (e) {
      g.emailStatus = 'failed'; g.emailError = (e instanceof Error ? e.message : 'Lỗi gửi email').slice(0, 300);
      return { ok: false, error: g.emailError };
    } finally {
      g.emailAttempts += 1;
      await g.save();
    }
  }

  /** Link thiệp chỉ mở được khi thiệp đã công khai -> gửi email sẽ tự công khai thiệp. */
  private async ensurePublished(inv: InvitationDocument, userId: string) {
    if (inv.status !== 'published') await this.invitations.setPublished(String(inv._id), userId, true);
  }

  async sendOne(userId: string, invId: string, guestId: string, message?: string) {
    const inv = await this.invitations.assertOwner(invId, userId);
    const g = await this.findGuest(invId, guestId);
    if (!g.email) throw new BadRequestException('Khách mời chưa có email');
    await this.ensurePublished(inv, userId);
    const r = await this.deliver(inv, g, message);
    if (!r.ok) throw new BadGatewayException(`Gửi email thất bại: ${r.error}`);
    return g.populate('group', 'name color');
  }

  async bulkSend(userId: string, invId: string, dto: BulkSendEmailDto) {
    const inv = await this.invitations.assertOwner(invId, userId);
    const f: Record<string, unknown> = { invitation: inv._id };
    if (dto.ids?.length) f._id = { $in: dto.ids };
    if (dto.onlyUnsent) f.emailStatus = { $ne: 'sent' };
    const all = await this.guests.find(f).limit(MAX_BULK_EMAIL + 1);
    if (all.length > MAX_BULK_EMAIL) throw new BadRequestException(`Mỗi lần chỉ gửi tối đa ${MAX_BULK_EMAIL} khách. Hãy chọn bớt.`);
    const withMail = all.filter((g) => g.email);
    const skipped = all.length - withMail.length;
    if (!withMail.length) throw new BadRequestException('Không có khách mời nào có email để gửi');
    await this.ensurePublished(inv, userId);

    const results: { guestId: string; name: string; email?: string; ok: boolean; error?: string }[] = [];
    for (let i = 0; i < withMail.length; i += EMAIL_CONCURRENCY) {
      const chunk = withMail.slice(i, i + EMAIL_CONCURRENCY);
      const out = await Promise.all(chunk.map((g) => this.deliver(inv, g, dto.message)));
      chunk.forEach((g, k) => results.push({ guestId: String(g._id), name: g.name, email: g.email, ...out[k] }));
    }
    const sent = results.filter((r) => r.ok).length;
    return { total: all.length, sent, failed: results.length - sent, skipped, results };
  }

  // ---------------------------------------------------------------- RSVP (công khai)
  async submitRsvp(idOrSlug: string, guestToken: string, dto: RsvpDto) {
    const inv = await this.invitations.findPublished(idOrSlug);
    if (!inv.settings.allowRsvp) throw new ForbiddenException('Thiệp này đã tắt xác nhận tham dự');
    if (inv.settings.rsvpDeadline && inv.settings.rsvpDeadline.getTime() < Date.now()) throw new ForbiddenException('Đã hết hạn xác nhận tham dự');
    const g = await this.guests.findOne({ invitation: inv._id, token: guestToken });
    if (!g) throw new NotFoundException('Liên kết khách mời không hợp lệ');
    g.status = dto.status;
    g.companions = dto.status === 'attending' ? Math.min(dto.companions ?? 0, inv.settings.maxCompanions) : 0;
    if (dto.message) g.rsvpMessage = dto.message;
    g.respondedAt = new Date();
    await g.save();
    return { name: g.name, status: g.status, companions: g.companions };
  }

  // ---------------------------------------------------------------- groups
  async listGroups(userId: string, invId: string) {
    await this.invitations.assertOwner(invId, userId);
    const [groups, counts] = await Promise.all([
      this.groups.find({ invitation: invId }).sort({ name: 1 }).lean(),
      this.guests.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { invitation: new Types.ObjectId(invId), group: { $ne: null } } }, { $group: { _id: '$group', n: { $sum: 1 } } },
      ]),
    ]);
    const m = new Map(counts.map((c) => [String(c._id), c.n]));
    return groups.map((g) => ({ ...g, guestCount: m.get(String(g._id)) ?? 0 }));
  }

  async createGroup(userId: string, invId: string, dto: GroupDto) {
    await this.invitations.assertOwner(invId, userId);
    if (await this.groups.exists({ invitation: invId, name: dto.name })) throw new ConflictException('Nhóm này đã tồn tại');
    return this.groups.create({ invitation: invId, ...dto });
  }

  async updateGroup(userId: string, invId: string, groupId: string, dto: GroupDto) {
    await this.invitations.assertOwner(invId, userId);
    if (await this.groups.exists({ invitation: invId, name: dto.name, _id: { $ne: groupId } })) throw new ConflictException('Nhóm này đã tồn tại');
    const g = await this.groups.findOneAndUpdate({ _id: groupId, invitation: invId }, { $set: dto }, { new: true });
    if (!g) throw new NotFoundException('Không tìm thấy nhóm');
    return g;
  }

  async removeGroup(userId: string, invId: string, groupId: string) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.groups.deleteOne({ _id: groupId, invitation: invId });
    if (!r.deletedCount) throw new NotFoundException('Không tìm thấy nhóm');
    await this.guests.updateMany({ invitation: invId, group: groupId }, { $set: { group: null } });
    return { message: 'Đã xoá nhóm' };
  }

  // ---------------------------------------------------------------- master guests (danh bạ)
  async listMaster(userId: string, q: PaginationQueryDto) {
    const f: Record<string, unknown> = { owner: new Types.ObjectId(userId) };
    if (q.search) { const r = new RegExp(esc(q.search.trim()), 'i'); f.$or = [{ name: r }, { email: r }, { phone: r }]; }
    const [items, total] = await Promise.all([
      this.master.find(f).sort({ name: 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      this.master.countDocuments(f),
    ]);
    return { items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) };
  }
}
