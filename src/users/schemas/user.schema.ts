import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  username: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  avatar?: string | null;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  personalImages: string[] | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  googleId?: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  facebookId?: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true, select: false })
  resetPasswordHash?: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  resetPasswordExpires?: Date | null;

  /** SHA-256 của mã OTP 6 số gửi qua email (tách riêng khỏi token đặt lại để không dùng OTP làm token) */
  @Column({ type: 'varchar', length: 128, nullable: true, select: false })
  resetOtpHash?: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  resetOtpExpires?: Date | null;

  /** Số lần nhập sai mã OTP hiện tại */
  @Column({ type: 'int', default: 0, select: false })
  resetOtpAttempts: number;
}
