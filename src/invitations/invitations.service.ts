import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_SETTINGS, Invitation, type InvitationSettings, type PlannerTask } from './schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { GuestGroup } from '../guests/schemas/guest-group.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';
import { StorageService } from '../storage/storage.service.js';
import { isObjectId, newObjectId } from '../common/utils/object-id.js';
import { slugify } from '../common/utils/slug.js';
import { externalizeDataUrls } from './utils/externalize-images.js';
import type { BudgetDto, CreateInvitationDto, UpdateInvitationDto, UpdateSettingsDto, UpdateTasksDto } from './dto/invitation.dto.js';

const MAX_DOC_BYTES = 12 * 1024 * 1024;
const ZERO_STATS = { totalGuests: 0, attending: 0, declined: 0, pending: 0, giftTotal: 0, headcount: 0, emailSent: 0, emailFailed: 0 };
export type InvitationStats = typeof ZERO_STATS;

const LIST_COLUMNS = [
  '_id', 'owner', 'title', 'slug', 'eventType', 'templateSlug', 'status', 'eventDate', 'cover',
  'info', 'settings', 'views', 'publishedAt', 'createdAt', 'updatedAt',
] as const;

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation) readonly repo: Repository<Invitation>,
    @InjectRepository(Guest) private readonly guests: Repository<Guest>,
    @InjectRepository(GuestGroup) private readonly groups: Repository<GuestGroup>,
    @InjectRepository(Wish) private readonly wishes: Repository<Wish>,
    private readonly storage: StorageService,
  ) {}

  /** Lấy thiệp thuộc về user, không thì 404 (không lộ việc thiệp có tồn tại). */
  async assertOwner(id: string, userId: string): Promise<Invitation> {
    const inv = await this.repo.findOne({ where: { _id: id, owner: userId } });
    if (!inv) throw new NotFoundException('Không tìm thấy thiệp mời');
    return inv;
  }

  /** Tìm theo _id hoặc slug (cho link công khai). */
  async findPublished(idOrSlug: string): Promise<Invitation> {
    const where = isObjectId(idOrSlug)
      ? { _id: idOrSlug, status: 'published' as const }
      : { slug: idOrSlug, status: 'published' as const };
    const inv = await this.repo.findOne({ where });
    if (!inv) throw new NotFoundException('Thiệp mời không tồn tại hoặc chưa được công khai');
    return inv;
  }

  async getStats(invitationId: string): Promise<InvitationStats> {
    const map = await this.getStatsMany([invitationId]);
    return map.get(invitationId) ?? { ...ZERO_STATS };
  }

  private async getStatsMany(ids: string[]): Promise<Map<string, InvitationStats>> {
    const out = new Map<string, InvitationStats>();
    if (!ids.length) return out;
    const rows = await this.guests
      .createQueryBuilder('g')
      .select('g.invitation', 'invitation')
      .addSelect('COUNT(*)', 'totalGuests')
      .addSelect("SUM(CASE WHEN g.status = 'attending' THEN 1 ELSE 0 END)", 'attending')
      .addSelect("SUM(CASE WHEN g.status = 'declined' THEN 1 ELSE 0 END)", 'declined')
      .addSelect("SUM(CASE WHEN g.status = 'pending' THEN 1 ELSE 0 END)", 'pending')
      .addSelect('COALESCE(SUM(g.giftAmount), 0)', 'giftTotal')
      .addSelect("COALESCE(SUM(CASE WHEN g.status = 'attending' THEN g.companions ELSE 0 END), 0)", 'companions')
      .addSelect("SUM(CASE WHEN g.emailStatus = 'sent' THEN 1 ELSE 0 END)", 'emailSent')
      .addSelect("SUM(CASE WHEN g.emailStatus = 'failed' THEN 1 ELSE 0 END)", 'emailFailed')
      .where('g.invitation IN (:...ids)', { ids })
      .groupBy('g.invitation')
      .getRawMany<Record<string, string | number>>();
    for (const r of rows) {
      const attending = Number(r.attending);
      const companions = Number(r.companions);
      out.set(String(r.invitation), {
        totalGuests: Number(r.totalGuests),
        attending,
        declined: Number(r.declined),
        pending: Number(r.pending),
        giftTotal: Number(r.giftTotal),
        headcount: attending + companions,
        emailSent: Number(r.emailSent),
        emailFailed: Number(r.emailFailed),
      });
    }
    return out;
  }

  private async processPayload(dto: Pick<UpdateInvitationDto, 'info' | 'page' | 'design'>, userId: string) {
    const up = (d: string) => this.storage.uploadDataUrl(d, `invitations/${userId}`);
    const out: Record<string, unknown> = {};
    for (const k of ['info', 'page', 'design'] as const) {
      if (dto[k] === undefined) continue;
      out[k] = this.storage.enabled ? await externalizeDataUrls(dto[k], up) : dto[k];
    }
    if (Buffer.byteLength(JSON.stringify(out)) > MAX_DOC_BYTES) {
      throw new PayloadTooLargeException('Thiết kế quá lớn. Hãy dùng ảnh nhỏ hơn hoặc cấu hình lưu trữ ảnh (R2).');
    }
    return out;
  }

  async create(userId: string, dto: CreateInvitationDto, cover?: Express.Multer.File) {
    const coverUrl = cover ? await this.storage.upload(cover.buffer, cover.mimetype, `covers/${userId}`) : dto.coverUrl;
    const payload = await this.processPayload(dto, userId);
    const inv = this.repo.create({
      owner: userId,
      title: dto.title,
      // Hậu tố ngẫu nhiên để hai thiệp cùng tên không đụng nhau (slug có ràng buộc unique)
      slug: `${slugify(dto.title).slice(0, 80) || 'thiep'}-${randomBytes(4).toString('hex')}`,
      eventType: dto.eventType ?? 'wedding',
      templateSlug: dto.templateSlug ?? null,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
      cover: coverUrl ?? null,
      status: dto.status ?? 'draft',
      publishedAt: dto.status === 'published' ? new Date() : null,
      info: {},
      page: {},
      design: {},
      settings: { ...DEFAULT_SETTINGS },
      budget: {},
      tasks: [],
      views: 0,
      ...payload,
    });
    await this.repo.save(inv);
    return { ...inv, stats: { ...ZERO_STATS } };
  }

  async list(userId: string) {
    const items = await this.repo.find({
      where: { owner: userId },
      select: [...LIST_COLUMNS],
      order: { createdAt: 'DESC' },
    });
    const stats = await this.getStatsMany(items.map((i) => i._id));
    return items.map((i) => ({ ...i, stats: stats.get(i._id) ?? { ...ZERO_STATS } }));
  }

  async get(id: string, userId: string) {
    const inv = await this.assertOwner(id, userId);
    return { ...inv, stats: await this.getStats(id) };
  }

  async update(id: string, userId: string, dto: UpdateInvitationDto, cover?: Express.Multer.File) {
    const inv = await this.assertOwner(id, userId);
    const set: Partial<Invitation> = { ...(await this.processPayload(dto, userId)) };
    if (dto.title !== undefined) set.title = dto.title;
    if (dto.eventType !== undefined) set.eventType = dto.eventType;
    if (dto.templateSlug !== undefined) set.templateSlug = dto.templateSlug;
    if (dto.eventDate !== undefined) set.eventDate = new Date(dto.eventDate);
    if (dto.status !== undefined) {
      set.status = dto.status;
      if (dto.status === 'published' && !inv.publishedAt) set.publishedAt = new Date();
    }
    if (cover) {
      set.cover = await this.storage.upload(cover.buffer, cover.mimetype, `covers/${userId}`);
      if (inv.cover) void this.storage.removeByUrl(inv.cover);
    } else if (dto.coverUrl !== undefined) {
      set.cover = dto.coverUrl;
    }
    Object.assign(inv, set);
    await this.repo.save(inv);
    return { ...inv, stats: await this.getStats(id) };
  }

  async setPublished(id: string, userId: string, published: boolean) {
    const inv = await this.assertOwner(id, userId);
    inv.status = published ? 'published' : 'draft';
    if (published && !inv.publishedAt) inv.publishedAt = new Date();
    await this.repo.save(inv);
    return { _id: inv._id, slug: inv.slug, status: inv.status, publishedAt: inv.publishedAt };
  }

  async remove(id: string, userId: string) {
    const inv = await this.assertOwner(id, userId);
    await this.guests.delete({ invitation: inv._id });
    await this.groups.delete({ invitation: inv._id });
    await this.wishes.delete({ invitation: inv._id });
    await this.repo.delete({ _id: inv._id });
    if (inv.cover) void this.storage.removeByUrl(inv.cover);
    return { message: 'Đã xoá thiệp mời' };
  }

  async updateSettings(id: string, userId: string, dto: UpdateSettingsDto): Promise<InvitationSettings> {
    const inv = await this.assertOwner(id, userId);
    const defined = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    inv.settings = { ...inv.settings, ...defined } as InvitationSettings;
    await this.repo.save(inv);
    return inv.settings;
  }

  async updateBudget(id: string, userId: string, dto: BudgetDto) {
    const inv = await this.assertOwner(id, userId);
    inv.budget = dto as unknown as Record<string, unknown>;
    await this.repo.save(inv);
    return inv.budget;
  }

  async getTasks(id: string, userId: string) {
    return (await this.assertOwner(id, userId)).tasks;
  }

  async updateTasks(id: string, userId: string, dto: UpdateTasksDto): Promise<PlannerTask[]> {
    const inv = await this.assertOwner(id, userId);
    inv.tasks = dto.tasks.map((t) => ({
      _id: t._id && isObjectId(t._id) ? t._id : newObjectId(),
      title: t.title,
      done: t.done ?? false,
      category: t.category,
      note: t.note,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
    }));
    await this.repo.save(inv);
    return inv.tasks;
  }

  /** Dữ liệu hiển thị cho khách: KHÔNG chứa owner / ngân sách / kế hoạch. */
  async getPublic(idOrSlug: string, guestToken?: string) {
    const inv = await this.findPublished(idOrSlug);
    void this.repo.increment({ _id: inv._id }, 'views', 1);
    let guest: { name: string; status: string; companions: number } | null = null;
    if (guestToken) {
      const g = await this.guests.findOne({ where: { invitation: inv._id, token: guestToken } });
      if (g) guest = { name: g.name, status: g.status, companions: g.companions };
    }
    const s = inv.settings;
    return {
      _id: inv._id, slug: inv.slug, title: inv.title, eventType: inv.eventType, templateSlug: inv.templateSlug,
      eventDate: inv.eventDate, cover: inv.cover, info: inv.info, page: inv.page, design: inv.design,
      settings: {
        allowRsvp: s.allowRsvp, allowWishes: s.allowWishes, moderateWishes: s.moderateWishes, showGuestList: s.showGuestList,
        maxCompanions: s.maxCompanions, rsvpDeadline: s.rsvpDeadline,
      },
      guest,
    };
  }
}
