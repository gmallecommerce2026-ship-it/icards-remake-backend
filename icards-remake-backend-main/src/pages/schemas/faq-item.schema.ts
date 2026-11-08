import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('faq_items')
export class FaqItem extends BaseEntity {
  /** id gốc của câu hỏi bên FE (vd "thiep-online-la-gi"), giữ nguyên để link/anchor không đổi */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  groupSlug: string;

  @Column({ type: 'varchar', length: 300 })
  q: string;

  @Column({ type: 'text' })
  a: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;
}
