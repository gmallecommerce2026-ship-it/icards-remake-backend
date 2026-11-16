import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import { InvitationsService } from '../invitations/invitations.service.js';
import { Invitation } from '../invitations/schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { MailService } from '../mail/mail.service.js';
import { EventReminder } from './schemas/event-reminder.schema.js';
import type { SaveRemindersDto } from './dto/reminders.dto.js';

/** Số khách đọc mỗi lần từ DB (theo _id) */
const PAGE_SIZE = 200;
/** Gửi song song tối đa 5 email, rồi nghỉ 1 giây (~300 email/phút, tránh giới hạn của Gmail) */
const CHUNK_SIZE = 5;
const CHUNK_PAUSE_MS = 1000;
/** Lịch nhắc bị "kẹt" ở trạng thái sending quá 30 phút (tiến trình đã chết) sẽ được nhận lại */
const STALE_CLAIM_MS = 30 * 60 * 1000;
const DUE_BATCH = 20;
const HOUR = 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * HOUR;

/** 08:00 giờ Việt Nam, daysBefore ngày trước ngày diễn ra (tính theo ngày giờ Việt Nam) */
export function computeSendAt(eventDate: Date | null, daysBefore: number): Date | null {
  if (!eventDate) return null;
  const v = new Date(eventDate.getTime() + VN_OFFSET_MS);
  return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate() - daysBefore, 1));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RemindersService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    @InjectRepository(EventReminder) private readonly repo: Repository<EventReminder>,
    @InjectRepository(Invitation) private readonly invRepo: Repository<Invitation>,
    @InjectRepository(Guest) private readonly guests: Repository<Guest>,
    private readonly invitations: InvitationsService,
    private readonly mail: MailService,
    private readonly cfg: ConfigService,
  ) {}

  // ------------------------------------------------------------ bộ lập lịch
  onModuleInit() {
    if (this.cfg.get<string>('REMINDER_ENABLED') === 'false') return;
    const interval = Number(this.cfg.get<string>('REMINDER_INTERVAL_MS') ?? 10 * 60 * 1000);
    this.timer = setInterval(() => void this.tick(), interval);
    this.timer.unref();
    this.log.log(`Bộ gửi nhắc lịch chạy mỗi ${Math.round(interval / 60000)} phút`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Một lần quét. Không chạy chồng nếu lần trước chưa xong. */
  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      // 1) Nhận lại các lịch bị kẹt do tiến trình trước đã dừng
      await this.repo
        .createQueryBuilder()
        .update()
        .set({ status: 'scheduled', claimedAt: null })
        .where('status = :s AND claimedAt < :t', { s: 'sending', t: new Date(now.getTime() - STALE_CLAIM_MS) })
        .execute();

      // 2) Lấy các lịch đã đến giờ (truy vấn chỉ mục, rẻ khi không có gì để gửi)
      const due = await this.repo.find({
        where: { status: 'scheduled', enabled: true, sendAt: LessThanOrEqual(now) },
        take: DUE_BATCH,
        order: { sendAt: 'ASC' },
      });

      for (const r of due) {
        // 3) Claim nguyên tử: nhiều instance cùng chạy vẫn chỉ có một instance nhận được lịch này
        const claim = await this.repo.update({ _id: r._id, status: 'scheduled' }, { status: 'sending', claimedAt: new Date() });
        if (!claim.affected) continue;
        try {
          await this.process(Object.assign(r, { status: 'sending' as const }));
        } catch (e) {
          this.log.error(`Lỗi gửi nhắc lịch ${r._id}: ${(e as Error).message}`);
          // trả về scheduled để lần quét sau thử lại (cursor được giữ nguyên)
          await this.repo.update({ _id: r._id }, { status: 'scheduled', claimedAt: null });
        }
      }
    } catch (e) {
      this.log.error(`Quét nhắc lịch thất bại: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private async process(r: EventReminder): Promise<void> {
    const inv = await this.invRepo.findOne({ where: { _id: r.invitation } });
    if (!inv) {
      await this.repo.update({ _id: r._id }, { status: 'skipped', claimedAt: null });
      return;
    }
    // Link thiệp chỉ mở được khi đã công khai: chưa công khai thì thử lại sau 1 giờ
    if (inv.status !== 'published') {
      await this.repo.update({ _id: r._id }, { status: 'scheduled', claimedAt: null, sendAt: new Date(Date.now() + HOUR) });
      return;
    }

    const st = inv.settings as unknown as Record<string, unknown>;
    const style = String(st.salutationStyle ?? 'Thân gửi');
    const info = inv.info as Record<string, string | undefined>;
    const when = [info.date, info.time].filter(Boolean).join(' · ') || (inv.eventDate ? inv.eventDate.toLocaleDateString('vi-VN') : undefined);
    const where = [info.venue, info.address].filter(Boolean).join(' - ') || undefined;
    const daysLeft = r.daysBefore;
    let cursor = r.cursor ?? '';

    for (;;) {
      // Chỉ nhắc khách CHƯA xác nhận và có email
      const page = await this.guests.find({
        where: { invitation: inv._id, status: 'pending', email: Not(IsNull()), _id: MoreThan(cursor) },
        order: { _id: 'ASC' },
        take: PAGE_SIZE,
      });
      if (!page.length) break;

      let ok = 0, failed = 0;
      for (let i = 0; i < page.length; i += CHUNK_SIZE) {
        const chunk = page.slice(i, i + CHUNK_SIZE);
        const results = await Promise.allSettled(
          chunk.map((g) =>
            this.mail.sendEventReminder({
              to: g.email!,
              salutation: `${style} ${g.name}`,
              title: inv.title,
              daysLeft,
              eventDate: when,
              venue: where,
              link: this.publicLink(inv, g.token),
            }),
          ),
        );
        ok += results.filter((x) => x.status === 'fulfilled').length;
        failed += results.filter((x) => x.status === 'rejected').length;
        if (i + CHUNK_SIZE < page.length) await sleep(CHUNK_PAUSE_MS);
      }

      cursor = page[page.length - 1]._id;
      await this.repo.update({ _id: r._id }, { cursor });
      if (ok) await this.repo.increment({ _id: r._id }, 'sentCount', ok);
      if (failed) await this.repo.increment({ _id: r._id }, 'failedCount', failed);
      if (page.length < PAGE_SIZE) break;
    }

    await this.repo.update({ _id: r._id }, { status: 'sent', sentAt: new Date(), claimedAt: null, cursor: null });
    this.log.log(`Đã gửi nhắc lịch ${r.daysBefore} ngày cho thiệp ${inv._id}`);
  }

  private publicLink(inv: Invitation, guestToken: string): string {
    const base = (this.cfg.get<string>('FRONTEND_URL') ?? '').split(',')[0].trim().replace(/\/+$/, '');
    const path = this.cfg.get<string>('PUBLIC_EVENT_PATH') ?? '/events/view';
    return `${base}${path}?${new URLSearchParams({ id: inv.slug, guestId: guestToken })}`;
  }

  // ------------------------------------------------------------ API cho chủ thiệp
  async assertAndList(invId: string, userId: string) {
    await this.invitations.assertOwner(invId, userId);
    return this.list(invId);
  }

  async list(invId: string) {
    const rows = await this.repo.find({ where: { invitation: invId }, order: { daysBefore: 'DESC' } });
    return rows.map((r) => ({
      id: r._id,
      daysBefore: r.daysBefore,
      isEnabled: r.enabled,
      status: r.status,
      sendAt: r.sendAt ?? null,
      sentCount: r.sentCount,
      failedCount: r.failedCount,
      sentAt: r.sentAt ?? null,
    }));
  }

  async save(invId: string, userId: string, dto: SaveRemindersDto) {
    await this.invitations.assertOwner(invId, userId);
    if (dto.eventDate) await this.invRepo.update({ _id: invId }, { eventDate: new Date(dto.eventDate) });
    const inv = await this.invRepo.findOne({ where: { _id: invId } });
    const eventDate = inv?.eventDate ?? null;
    const now = Date.now();

    const wanted = new Map(dto.emailReminders.map((x) => [x.daysBefore, x.isEnabled]));
    const existing = await this.repo.find({ where: { invitation: invId } });

    // Xoá lịch đã bỏ (trừ lịch đang gửi)
    for (const row of existing) {
      if (!wanted.has(row.daysBefore) && row.status !== 'sending') await this.repo.delete({ _id: row._id });
    }

    for (const [daysBefore, enabled] of wanted) {
      let row = existing.find((r) => r.daysBefore === daysBefore);
      if (!row) {
        row = this.repo.create({ invitation: invId, owner: userId, daysBefore, enabled, status: 'scheduled', sentCount: 0, failedCount: 0 });
      }
      row.enabled = enabled;
      // Lịch đã gửi hoặc đang gửi thì giữ nguyên, không gửi lại
      if (row.status === 'scheduled' || row.status === 'skipped') {
        row.sendAt = computeSendAt(eventDate, daysBefore);
        row.status = row.sendAt && row.sendAt.getTime() > now ? 'scheduled' : 'skipped';
      }
      await this.repo.save(row);
    }
    return this.list(invId);
  }
}
