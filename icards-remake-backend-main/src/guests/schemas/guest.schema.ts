import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

export const RSVP = ['pending', 'attending', 'declined'] as const;
export type RsvpStatus = (typeof RSVP)[number];
export const EMAIL_STATUS = ['not-sent', 'sent', 'failed'] as const;
export type EmailStatus = (typeof EMAIL_STATUS)[number];

@Entity('guests')
@Index(['invitation', 'email'])
@Index(['invitation', 'status'])
export class Guest extends BaseEntity {
  @Index()
  @Column({ type: 'char', length: 24 })
  invitation: string;

  @Column({ type: 'char', length: 24 })
  owner: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  /** Lưu id nhóm; API trả về object `group` (xem GuestsService.withGroup) */
  @Column({ type: 'char', length: 24, nullable: true })
  groupId: string | null;

  @Column({ type: 'enum', enum: RSVP, default: 'pending' })
  status: RsvpStatus;

  /** "Đi cùng": số người đi kèm */
  @Column({ type: 'int', default: 0 })
  companions: number;

  /** "Mừng cưới" (VND) */
  @Column({ type: 'double', default: 0 })
  giftAmount: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  note?: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  rsvpMessage?: string | null;

  @Column({ type: 'datetime', nullable: true })
  respondedAt?: Date | null;

  /** Mã bí mật trong link thiệp cá nhân hoá (?guestId=<token>) */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  token: string;

  @Column({ type: 'enum', enum: EMAIL_STATUS, default: 'not-sent' })
  emailStatus: EmailStatus;

  @Column({ type: 'datetime', nullable: true })
  emailSentAt?: Date | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  emailError?: string | null;

  @Column({ type: 'int', default: 0 })
  emailAttempts: number;
}
