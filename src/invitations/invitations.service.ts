import { Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invitation, type InvitationDocument } from './schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { GuestGroup } from '../guests/schemas/guest-group.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';
import { StorageService } from '../storage/storage.service.js';
import { isObjectId } from '../common/utils/object-id.js';
import { slugify } from '../common/utils/slug.js';
import { externalizeDataUrls } from './utils/externalize-images.js';
import type { BudgetDto, CreateInvitationDto, UpdateInvitationDto, UpdateSettingsDto, UpdateTasksDto } from './dto/invitation.dto.js';

const MAX_DOC_BYTES = 12 * 1024 * 1024;
const ZERO_STATS = { totalGuests: 0, attending: 0, declined: 0, pending: 0, giftTotal: 0, headcount: 0, emailSent: 0, emailFailed: 0 };
export type InvitationStats = typeof ZERO_STATS;

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name) readonly model: Model<Invitation>,
    @InjectModel(Guest.name) private readonly guests: Model<Guest>,
    @InjectModel(GuestGroup.name) private readonly groups: Model<GuestGroup>,
    @InjectModel(Wish.name) private readonly wishes: Model<Wish>,
    private readonly storage: StorageService,
  ) {}

  /** Lấy thiệp thuộc về user, không thì 404 (không lộ việc thiệp có tồn tại). */
  async assertOwner(id: string, userId: string): Promise<InvitationDocument> {
    const inv = await this.model.findOne({ _id: id, owner: userId });
    if (!inv) throw new NotFoundException('Không tìm thấy thiệp mời');
    return inv;
  }

  /** Tìm theo _id hoặc slug (cho link công khai). */
  async findPublished(idOrSlug: string): Promise<InvitationDocument> {
    const q = isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const inv = await this.model.findOne({ ...q, status: 'published' });
    if (!inv) throw new NotFoundException('Thiệp mời không tồn tại hoặc chưa được công khai');
    return inv;
  }

  async getStats(invitationId: string): Promise<InvitationStats> {
    const map = await this.getStatsMany([invitationId]);
    return map.get(invitationId) ?? { ...ZERO_STATS };
  }

  private async getStatsMany(ids: string[]): Promise<Map<string, InvitationStats>> {
    const rows = await this.guests.aggregate<{ _id: Types.ObjectId } & Record<string, number>>([
      { $match: { invitation: { $in: ids.map((i) => new Types.ObjectId(i)) } } },
      {
        $group: {
          _id: '$invitation',
          totalGuests: { $sum: 1 },
          attending: { $sum: { $cond: [{ $eq: ['$status', 'attending'] }, 1, 0] } },
          declined: { $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          giftTotal: { $sum: '$giftAmount' },
          companions: { $sum: { $cond: [{ $eq: ['$status', 'attending'] }, '$companions', 0] } },
          emailSent: { $sum: { $cond: [{ $eq: ['$emailStatus', 'sent'] }, 1, 0] } },
          emailFailed: { $sum: { $cond: [{ $eq: ['$emailStatus', 'failed'] }, 1, 0] } },
        },
      },
    ]);
    const out = new Map<string, InvitationStats>();
    for (const r of rows) {
      out.set(String(r._id), {
        totalGuests: r.totalGuests, attending: r.attending, declined: r.declined, pending: r.pending,
        giftTotal: r.giftTotal, headcount: r.attending + r.companions, emailSent: r.emailSent, emailFailed: r.emailFailed,
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

  private eventDateOf(dto: UpdateInvitationDto): Date | undefined {
    if (dto.eventDate) return new Date(dto.eventDate);
    return undefined;
  }

  async create(userId: string, dto: CreateInvitationDto, cover?: Express.Multer.File) {
    const coverUrl = cover ? await this.storage.upload(cover.buffer, cover.mimetype, `covers/${userId}`) : dto.coverUrl;
    const payload = await this.processPayload(dto, userId);
    const inv = await this.model.create({
      owner: userId,
      title: dto.title,
      slug: slugify(dto.title),
      eventType: dto.eventType,
      templateSlug: dto.templateSlug,
      eventDate: this.eventDateOf(dto),
      cover: coverUrl,
      status: dto.status ?? 'draft',
      publishedAt: dto.status === 'published' ? new Date() : undefined,
      ...payload,
    });
    return { ...inv.toObject(), stats: { ...ZERO_STATS } };
  }

  async list(userId: string) {
    const items = await this.model.find({ owner: userId }).select('-page -design -tasks -budget').sort({ createdAt: -1 }).lean();
    const stats = await this.getStatsMany(items.map((i) => String(i._id)));
    return items.map((i) => ({ ...i, stats: stats.get(String(i._id)) ?? { ...ZERO_STATS } }));
  }

  async get(id: string, userId: string) {
    const inv = await this.assertOwner(id, userId);
    return { ...inv.toObject(), stats: await this.getStats(id) };
  }

  async update(id: string, userId: string, dto: UpdateInvitationDto, cover?: Express.Multer.File) {
    const inv = await this.assertOwner(id, userId);
    const set: Record<string, unknown> = { ...(await this.processPayload(dto, userId)) };
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
    } else if (dto.coverUrl !== undefined) set.cover = dto.coverUrl;
    const next = await this.model.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
    return { ...next!.toObject(), stats: await this.getStats(id) };
  }

  async setPublished(id: string, userId: string, published: boolean) {
    const inv = await this.assertOwner(id, userId);
    inv.status = published ? 'published' : 'draft';
    if (published && !inv.publishedAt) inv.publishedAt = new Date();
    await inv.save();
    return { _id: String(inv._id), slug: inv.slug, status: inv.status, publishedAt: inv.publishedAt };
  }

  async remove(id: string, userId: string) {
    const inv = await this.assertOwner(id, userId);
    await Promise.all([
      this.guests.deleteMany({ invitation: inv._id }),
      this.groups.deleteMany({ invitation: inv._id }),
      this.wishes.deleteMany({ invitation: inv._id }),
      this.model.deleteOne({ _id: inv._id }),
    ]);
    if (inv.cover) void this.storage.removeByUrl(inv.cover);
    return { message: 'Đã xoá thiệp mời' };
  }

  async updateSettings(id: string, userId: string, dto: UpdateSettingsDto) {
    await this.assertOwner(id, userId);
    const $set = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined).map(([k, v]) => [`settings.${k}`, v]));
    const inv = await this.model.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).select('settings');
    return inv!.settings;
  }

  async updateBudget(id: string, userId: string, dto: BudgetDto) {
    await this.assertOwner(id, userId);
    const inv = await this.model.findByIdAndUpdate(id, { $set: { budget: dto } }, { new: true }).select('budget');
    return inv!.budget;
  }

  async getTasks(id: string, userId: string) {
    return (await this.assertOwner(id, userId)).tasks;
  }

  async updateTasks(id: string, userId: string, dto: UpdateTasksDto) {
    await this.assertOwner(id, userId);
    const tasks = dto.tasks.map((t) => ({
      ...(t._id && /^[a-f\d]{24}$/i.test(t._id) ? { _id: t._id } : {}),
      title: t.title, done: t.done ?? false, category: t.category, note: t.note,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
    }));
    const inv = await this.model.findByIdAndUpdate(id, { $set: { tasks } }, { new: true, runValidators: true }).select('tasks');
    return inv!.tasks;
  }

  /** Dữ liệu hiển thị cho khách: KHÔNG chứa owner / ngân sách / kế hoạch. */
  async getPublic(idOrSlug: string, guestToken?: string) {
    const inv = await this.findPublished(idOrSlug);
    void this.model.updateOne({ _id: inv._id }, { $inc: { views: 1 } }).exec();
    let guest: { name: string; status: string; companions: number } | null = null;
    if (guestToken) {
      const g = await this.guests.findOne({ invitation: inv._id, token: guestToken }).select('name status companions').lean();
      if (g) guest = { name: g.name, status: g.status, companions: g.companions };
    }
    const s = inv.settings;
    return {
      _id: String(inv._id), slug: inv.slug, title: inv.title, eventType: inv.eventType, templateSlug: inv.templateSlug,
      eventDate: inv.eventDate, cover: inv.cover, info: inv.info, page: inv.page, design: inv.design,
      settings: { allowRsvp: s.allowRsvp, allowWishes: s.allowWishes, showGuestList: s.showGuestList, maxCompanions: s.maxCompanions, rsvpDeadline: s.rsvpDeadline },
      guest,
    };
  }
}
