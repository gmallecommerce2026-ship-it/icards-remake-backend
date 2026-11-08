import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

export const EVENT_TYPES = ['wedding', 'birthday', 'baby', 'event'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface InvitationSettings {
  allowRsvp: boolean;
  allowWishes: boolean;
  /** true: lời chúc phải được chủ thiệp duyệt mới hiện công khai */
  moderateWishes: boolean;
  showGuestList: boolean;
  maxCompanions: number;
  /** ISO string (lưu trong cột JSON) */
  rsvpDeadline?: string | null;
}

export const DEFAULT_SETTINGS: InvitationSettings = {
  allowRsvp: true,
  allowWishes: true,
  moderateWishes: false,
  showGuestList: false,
  maxCompanions: 5,
};

export interface PlannerTask {
  _id: string;
  title: string;
  done: boolean;
  /** ISO string */
  dueDate?: string;
  category?: string;
  note?: string;
}

@Entity('invitations')
@Index(['owner', 'createdAt'])
export class Invitation extends BaseEntity {
  @Index()
  @Column({ type: 'char', length: 24 })
  owner: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'enum', enum: EVENT_TYPES, default: 'wedding' })
  eventType: EventType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  templateSlug?: string | null;

  @Index()
  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'draft' })
  status: 'draft' | 'published';

  @Column({ type: 'datetime', nullable: true })
  eventDate?: Date | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  cover?: string | null;

  /** EventPageData.info của studio: { title, description, host, date, time, venue, address } */
  @Column({ type: 'json' })
  info: Record<string, unknown>;

  /** EventPageData còn lại: { styleId, accent, bg, blocks[] } */
  @Column({ type: 'json' })
  page: Record<string, unknown>;

  /** Thiết kế thiệp: { pages, backdrops, envelope:{color,liner,stampId,recipientName} } */
  @Column({ type: 'json' })
  design: Record<string, unknown>;

  @Column({ type: 'json' })
  settings: InvitationSettings;

  /** Ngân sách (PUT /budgetRequest): { total, items:[{name,estimate,actual,paid,note}] } */
  @Column({ type: 'json' })
  budget: Record<string, unknown>;

  @Column({ type: 'json' })
  tasks: PlannerTask[];

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date | null;
}
