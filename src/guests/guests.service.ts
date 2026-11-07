import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository, type FindOptionsWhere } from 'typeorm';
import { Guest, type RsvpStatus } from './schemas/guest.schema.js';
import { GuestGroup } from './schemas/guest-group.schema.js';
import { MasterGuest } from './schemas/master-guest.schema.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import type { Invitation } from '../invitations/schemas/invitation.schema.js';
import { MailService } from '../mail/mail.service.js';
import { randomToken } from '../common/utils/slug.js';
import { escapeLike } from '../common/utils/object-id.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type {
  BulkCreateGuestsDto, BulkSendEmailDto, BulkUpdateGuestsDto, CreateGuestDto, GroupDto, GuestsQueryDto, RsvpDto, UpdateGuestDto,
} from './dto/guest.dto.js';

const MAX_BULK_EMAIL = 300;
const EMAIL_CONCURRENCY = 5;

type GroupRef = { _id: string; name: string; color?: string | null };
/** Khách sau khi "populate" nhóm: groupId -> group (object hoặc null), giống API cũ. */
export type GuestView = Omit<Guest, 'groupId' | 'assignId'> & { group: GroupRef | null };

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest) private readonly guests: Repository<Guest>,
    @InjectRepository(GuestGroup) private readonly groups: Repository<GuestGroup>,
    @InjectRepository(MasterGuest) private readonly master: Repository<MasterGuest>,
    private readonly invitations: InvitationsService,
    private readonly mail: MailService,
    private readonly cfg: ConfigService,
  ) {}

  // ---------------------------------------------------------------- helpers
  /** Trả về groupId: null (bỏ nhóm), string (id nhóm), hoặc undefined (không đổi). */
  private async resolveGroup(invId: string, dto: { groupId?: string | null; group?: string }): Promise<string | null | undefined> {
    if (dto.groupId === null) return null;
    if (dto.groupId) {
      if (!(await this.groups.exists({ where: { _id: dto.groupId, invitation: invId } }))) {
        throw new BadRequestException('Nhóm khách mời không tồn tại');
      }
      return dto.groupId;
    }
    if (dto.group) {
      let g = await this.groups.findOne({ where: { invitation: invId, name: dto.group } });
      if (!g) {
        try {
          g = await this.groups.save(this.groups.create({ invitation: invId, name: dto.group }));
        } catch {
          // đụng unique (invitation, name) do request song song -> lấy lại nhóm đã tạo
          g = await this.groups.findOneOrFail({ where: { invitation: invId, name: dto.group } });
        }
      }
      return g._id;
    }
    return undefined;
  }

  /** Lưu vào danh bạ (best-effort, lỗi bỏ qua) */
  private async remember(owner: string, g: { name: string; email?: string; phone?: string }, groupName?: string) {
    const email = g.email?.toLowerCase();
    const key = email ? { email } : g.phone ? { phone: g.phone } : null;
    if (!key) return;
    try {
      const existing = await this.master.findOne({ where: { owner, ...key } });
      const values: Partial<MasterGuest> = { name: g.name };
      if (g.phone) values.phone = g.phone;
      if (groupName) values.groupName = groupName;
      if (existing) await this.master.update({ _id: existing._id }, values);
      else await this.master.save(this.master.create({ owner, ...key, ...values }));
    } catch { /* trùng khoá chéo email/phone: bỏ qua */ }
  }

  /** Thay groupId bằng object group (giống populate của Mongoose). */
  private async withGroup(list: Guest[]): Promise<GuestView[]> {
    const ids = [...new Set(list.map((g) => g.groupId).filter((x): x is string => !!x))];
    const map = new Map<string, GroupRef>();
    if (ids.length) {
      const gs = await this.groups.find({ where: { _id: In(ids) } });
      for (const g of gs) map.set(g._id, { _id: g._id, name: g.name, color: g.color });
    }
    return list.map(({ groupId, ...rest }) => ({ ...rest, group: groupId ? map.get(groupId) ?? null : null }));
  }

  publicLink(inv: Invitation, guestToken: string): string {
    const base = (this.cfg.get<string>('FRONTEND_URL') ?? '').split(',')[0].trim().replace(/\/+$/, '');
    const path = this.cfg.get<string>('PUBLIC_EVENT_PATH') ?? '/events/view';
    return `${base}${path}?${new URLSearchParams({ id: inv.slug, guestId: guestToken })}`;
  }

  private async findGuest(invId: string, guestId: string): Promise<Guest> {
    const g = await this.guests.findOne({ where: { _id: guestId, invitation: invId } });
    if (!g) throw new NotFoundException('Không tìm thấy khách mời');
    return g;
  }

  // ---------------------------------------------------------------- guests CRUD
  async list(userId: string, invId: string, q: GuestsQueryDto) {
    await this.invitations.assertOwner(invId, userId);
    const qb = this.guests.createQueryBuilder('g').where('g.invitation = :inv', { inv: invId });
    if (q.groupId) qb.andWhere('g.groupId = :gid', { gid: q.groupId });
    if (q.status) qb.andWhere('g.status = :st', { st: q.status === 'not-attending' ? 'declined' : q.status });
    if (q.emailStatus) qb.andWhere('g.emailStatus = :es', { es: q.emailStatus });
    if (q.search) {
      const s = `%${escapeLike(q.search.trim())}%`;
      qb.andWhere('(g.name LIKE :s OR g.email LIKE :s OR g.phone LIKE :s)', { s });
    }
    const [rows, total, stats] = await Promise.all([
      qb.clone().orderBy('g.createdAt', 'ASC').skip((q.page - 1) * q.limit).take(q.limit).getMany(),
      qb.getCount(),
      this.invitations.getStats(invId),
    ]);
    const items = await this.withGroup(rows);
    return { items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit), stats };
  }

  async create(userId: string, invId: string, dto: CreateGuestDto) {
    await this.invitations.assertOwner(invId, userId);
    const email = dto.email?.toLowerCase();
    if (email && (await this.guests.exists({ where: { invitation: invId, email } }))) {
      throw new ConflictException('Email này đã có trong danh sách khách mời');
    }
    const groupId = await this.resolveGroup(invId, dto);
    const g = await this.guests.save(this.guests.create({
      invitation: invId, owner: userId, name: dto.name, email, phone: dto.phone, groupId: groupId ?? null,
      companions: dto.companions ?? 0, giftAmount: dto.giftAmount ?? 0, note: dto.note, token: randomToken(),
    }));
    await this.remember(userId, { ...dto, email }, dto.group);
    return (await this.withGroup([g]))[0];
  }

  async bulkCreate(userId: string, invId: string, dto: BulkCreateGuestsDto) {
    await this.invitations.assertOwner(invId, userId);
    const existing = new Set(
      (await this.guests.find({ where: { invitation: invId }, select: ['email'] }))
        .map((g) => g.email)
        .filter((e): e is string => !!e),
    );
    const skipped: { index: number; name: string; reason: string }[] = [];
    const docs: Guest[] = [];
    const groupCache = new Map<string, string | null | undefined>();
    for (const [index, g] of dto.guests.entries()) {
      const email = g.email?.toLowerCase();
      if (email && existing.has(email)) { skipped.push({ index, name: g.name, reason: 'Email đã tồn tại' }); continue; }
      if (email) existing.add(email);
      const key = `${g.groupId ?? ''}|${g.group ?? ''}`;
      if (!groupCache.has(key)) groupCache.set(key, await this.resolveGroup(invId, g));
      docs.push(this.guests.create({
        invitation: invId, owner: userId, name: g.name, email, phone: g.phone,
        groupId: groupCache.get(key) ?? null, companions: g.companions ?? 0, giftAmount: g.giftAmount ?? 0,
        note: g.note, token: randomToken(),
      }));
    }
    const created = docs.length ? await this.guests.save(docs) : [];
    for (const g of dto.guests) await this.remember(userId, g, g.group);
    return { created: created.length, skipped, guests: await this.withGroup(created) };
  }

  async update(userId: string, invId: string, guestId: string, dto: UpdateGuestDto) {
    await this.invitations.assertOwner(invId, userId);
    const g = await this.findGuest(invId, guestId);
    const email = dto.email?.toLowerCase();
    if (email && email !== g.email
      && (await this.guests.exists({ where: { invitation: invId, email, _id: Not(g._id) } }))) {
      throw new ConflictException('Email này đã có trong danh sách khách mời');
    }
    const groupId = await this.resolveGroup(invId, dto);
    if (dto.name !== undefined) g.name = dto.name;
    if (email !== undefined) g.email = email;
    if (dto.phone !== undefined) g.phone = dto.phone;
    if (dto.companions !== undefined) g.companions = dto.companions;
    if (dto.giftAmount !== undefined) g.giftAmount = dto.giftAmount;
    if (dto.note !== undefined) g.note = dto.note;
    if (groupId !== undefined) g.groupId = groupId;
    if (dto.status) {
      g.status = dto.status;
      g.respondedAt = dto.status === 'pending' ? null : new Date();
    }
    await this.guests.save(g);
    return (await this.withGroup([g]))[0];
  }

  async remove(userId: string, invId: string, guestId: string) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.guests.delete({ _id: guestId, invitation: invId });
    if (!r.affected) throw new NotFoundException('Không tìm thấy khách mời');
    return { message: 'Đã xoá khách mời' };
  }

  async bulkUpdate(userId: string, invId: string, dto: BulkUpdateGuestsDto) {
    await this.invitations.assertOwner(invId, userId);
    const u = dto.update;
    const set: Partial<Guest> = {};
    if (u.groupId !== undefined) set.groupId = (await this.resolveGroup(invId, { groupId: u.groupId })) ?? null;
    if (u.status) {
      set.status = u.status as RsvpStatus;
      set.respondedAt = u.status === 'pending' ? null : new Date();
    }
    if (u.companions !== undefined) set.companions = u.companions;
    if (u.giftAmount !== undefined) set.giftAmount = u.giftAmount;
    if (!Object.keys(set).length) throw new BadRequestException('Không có trường nào để cập nhật');
    const r = await this.guests.update({ _id: In(dto.ids), invitation: invId }, set);
    const n = r.affected ?? 0;
    return { matched: n, modified: n };
  }

  async bulkDelete(userId: string, invId: string, ids: string[]) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.guests.delete({ _id: In(ids), invitation: invId });
    return { deleted: r.affected ?? 0 };
  }

  // ---------------------------------------------------------------- email
  private async deliver(inv: Invitation, g: Guest, message?: string): Promise<{ ok: boolean; error?: string }> {
    const info = inv.info as Record<string, string | undefined>;
    try {
      await this.mail.sendInvitation({
        to: g.email!, guestName: g.name, title: inv.title, hostName: info.host, message,
        eventDate: [info.date, info.time].filter(Boolean).join(' · ') || (inv.eventDate ? inv.eventDate.toLocaleDateString('vi-VN') : undefined),
        venue: [info.venue, info.address].filter(Boolean).join(' - ') || undefined,
        link: this.publicLink(inv, g.token),
      });
      g.emailStatus = 'sent'; g.emailSentAt = new Date(); g.emailError = null;
      return { ok: true };
    } catch (e) {
      g.emailStatus = 'failed'; g.emailError = (e instanceof Error ? e.message : 'Lỗi gửi email').slice(0, 300);
      return { ok: false, error: g.emailError };
    } finally {
      g.emailAttempts += 1;
      await this.guests.save(g);
    }
  }

  /** Link thiệp chỉ mở được khi thiệp đã công khai -> gửi email sẽ tự công khai thiệp. */
  private async ensurePublished(inv: Invitation, userId: string) {
    if (inv.status !== 'published') await this.invitations.setPublished(inv._id, userId, true);
  }

  async sendOne(userId: string, invId: string, guestId: string, message?: string) {
    const inv = await this.invitations.assertOwner(invId, userId);
    const g = await this.findGuest(invId, guestId);
    if (!g.email) throw new BadRequestException('Khách mời chưa có email');
    await this.ensurePublished(inv, userId);
    const r = await this.deliver(inv, g, message);
    if (!r.ok) throw new BadGatewayException(`Gửi email thất bại: ${r.error}`);
    return (await this.withGroup([g]))[0];
  }

  async bulkSend(userId: string, invId: string, dto: BulkSendEmailDto) {
    const inv = await this.invitations.assertOwner(invId, userId);
    const where: FindOptionsWhere<Guest> = { invitation: inv._id };
    if (dto.ids?.length) where._id = In(dto.ids);
    if (dto.onlyUnsent) where.emailStatus = Not('sent');
    const all = await this.guests.find({ where, take: MAX_BULK_EMAIL + 1 });
    if (all.length > MAX_BULK_EMAIL) throw new BadRequestException(`Mỗi lần chỉ gửi tối đa ${MAX_BULK_EMAIL} khách. Hãy chọn bớt.`);
    const withMail = all.filter((g) => g.email);
    const skipped = all.length - withMail.length;
    if (!withMail.length) throw new BadRequestException('Không có khách mời nào có email để gửi');
    await this.ensurePublished(inv, userId);

    const results: { guestId: string; name: string; email?: string | null; ok: boolean; error?: string }[] = [];
    for (let i = 0; i < withMail.length; i += EMAIL_CONCURRENCY) {
      const chunk = withMail.slice(i, i + EMAIL_CONCURRENCY);
      const out = await Promise.all(chunk.map((g) => this.deliver(inv, g, dto.message)));
      chunk.forEach((g, k) => results.push({ guestId: g._id, name: g.name, email: g.email, ...out[k] }));
    }
    const sent = results.filter((r) => r.ok).length;
    return { total: all.length, sent, failed: results.length - sent, skipped, results };
  }

  // ---------------------------------------------------------------- RSVP (công khai)
  async submitRsvp(idOrSlug: string, guestToken: string, dto: RsvpDto) {
    const inv = await this.invitations.findPublished(idOrSlug);
    if (!inv.settings.allowRsvp) throw new ForbiddenException('Thiệp này đã tắt xác nhận tham dự');
    const deadline = inv.settings.rsvpDeadline ? new Date(inv.settings.rsvpDeadline) : null;
    if (deadline && deadline.getTime() < Date.now()) throw new ForbiddenException('Đã hết hạn xác nhận tham dự');
    const g = await this.guests.findOne({ where: { invitation: inv._id, token: guestToken } });
    if (!g) throw new NotFoundException('Liên kết khách mời không hợp lệ');
    g.status = dto.status;
    g.companions = dto.status === 'attending' ? Math.min(dto.companions ?? 0, inv.settings.maxCompanions) : 0;
    if (dto.message) g.rsvpMessage = dto.message;
    g.respondedAt = new Date();
    await this.guests.save(g);
    return { name: g.name, status: g.status, companions: g.companions };
  }

  // ---------------------------------------------------------------- groups
  async listGroups(userId: string, invId: string) {
    await this.invitations.assertOwner(invId, userId);
    const groups = await this.groups.find({ where: { invitation: invId }, order: { name: 'ASC' } });
    const counts = await this.guests
      .createQueryBuilder('g')
      .select('g.groupId', 'groupId')
      .addSelect('COUNT(*)', 'n')
      .where('g.invitation = :inv', { inv: invId })
      .andWhere('g.groupId IS NOT NULL')
      .groupBy('g.groupId')
      .getRawMany<{ groupId: string; n: string | number }>();
    const m = new Map(counts.map((c) => [c.groupId, Number(c.n)]));
    return groups.map((g) => ({ ...g, guestCount: m.get(g._id) ?? 0 }));
  }

  async createGroup(userId: string, invId: string, dto: GroupDto) {
    await this.invitations.assertOwner(invId, userId);
    if (await this.groups.exists({ where: { invitation: invId, name: dto.name } })) throw new ConflictException('Nhóm này đã tồn tại');
    return this.groups.save(this.groups.create({ invitation: invId, name: dto.name, color: dto.color }));
  }

  async updateGroup(userId: string, invId: string, groupId: string, dto: GroupDto) {
    await this.invitations.assertOwner(invId, userId);
    if (await this.groups.exists({ where: { invitation: invId, name: dto.name, _id: Not(groupId) } })) {
      throw new ConflictException('Nhóm này đã tồn tại');
    }
    const g = await this.groups.findOne({ where: { _id: groupId, invitation: invId } });
    if (!g) throw new NotFoundException('Không tìm thấy nhóm');
    g.name = dto.name;
    if (dto.color !== undefined) g.color = dto.color;
    return this.groups.save(g);
  }

  async removeGroup(userId: string, invId: string, groupId: string) {
    await this.invitations.assertOwner(invId, userId);
    const r = await this.groups.delete({ _id: groupId, invitation: invId });
    if (!r.affected) throw new NotFoundException('Không tìm thấy nhóm');
    await this.guests.update({ invitation: invId, groupId }, { groupId: null });
    return { message: 'Đã xoá nhóm' };
  }

  // ---------------------------------------------------------------- master guests (danh bạ)
  async listMaster(userId: string, q: PaginationQueryDto) {
    const qb = this.master.createQueryBuilder('m').where('m.owner = :o', { o: userId });
    if (q.search) {
      const s = `%${escapeLike(q.search.trim())}%`;
      qb.andWhere('(m.name LIKE :s OR m.email LIKE :s OR m.phone LIKE :s)', { s });
    }
    const [items, total] = await Promise.all([
      qb.clone().orderBy('m.name', 'ASC').skip((q.page - 1) * q.limit).take(q.limit).getMany(),
      qb.getCount(),
    ]);
    return { items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) };
  }
}
