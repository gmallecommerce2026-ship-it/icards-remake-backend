import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

/** Dịch vụ thiết kế/tư vấn (khác với "products" là hàng hóa in ấn). */
@Entity('services')
export class Service extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  summary: string;

  @Column({ type: 'text' })
  description: string;

  /** VND */
  @Column({ type: 'int' })
  priceFrom: number;

  @Column({ type: 'varchar', length: 100 })
  duration: string;

  @Column({ type: 'varchar', length: 200 })
  audience: string;

  @Column({ type: 'json' })
  includes: string[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;
}
