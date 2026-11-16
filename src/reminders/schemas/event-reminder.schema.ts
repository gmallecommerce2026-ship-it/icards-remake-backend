import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

export const REMINDER_STATUS = ['scheduled', 'sending', 'sent', 'skipped'] as const;
export type ReminderStatus = (typeof REMINDER_STATUS)[number];

/**
 * Một lịch nhắc của thiệp. Trạng thái:
 * scheduled → (tới giờ, được claim) sending → sent
 * skipped: không gửi được (không có ngày diễn ra hoặc mốc đã qua).
 */
@Entity('event_reminders')
@Index(['status', 'sendAt'])
@Index(['invitation', 'daysBefore'], { unique: true })
export class EventReminder extends BaseEntity {
  @Column({ type: 'char', length: 24 })
  invitation: string;

  @Column({ type: 'char', length: 24 })
  owner: string;

  @Column({ type: 'int' })
  daysBefore: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'enum', enum: REMINDER_STATUS, default: 'scheduled' })
  status: ReminderStatus;

  /** Thời điểm gửi (08:00 giờ Việt Nam) */
  @Column({ type: 'datetime', nullable: true })
  sendAt?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  claimedAt?: Date | null;

  /** Khách cuối cùng đã xử lý; dùng để tiếp tục nếu tiến trình bị dừng giữa chừng */
  @Column({ type: 'char', length: 24, nullable: true })
  cursor?: string | null;

  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @Column({ type: 'int', default: 0 })
  failedCount: number;

  @Column({ type: 'datetime', nullable: true })
  sentAt?: Date | null;
}
