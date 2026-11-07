import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('wishes')
@Index(['invitation', 'createdAt'])
export class Wish extends BaseEntity {
  @Index()
  @Column({ type: 'char', length: 24 })
  invitation: string;

  @Column({ type: 'char', length: 24, nullable: true })
  guest: string | null;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'text' })
  message: string;

  /** false: đang chờ duyệt / bị ẩn */
  @Index()
  @Column({ type: 'boolean', default: true })
  isApproved: boolean;
}
