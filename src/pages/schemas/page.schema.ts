import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import type { PostBlock, Tone } from '../../catalog/catalog.types.js';

/** Trang nội dung: bài blog (isBlog = true) hoặc trang tĩnh. */
@Entity('pages')
export class Page extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt?: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  isBlog: boolean;

  /** Ngày đăng (yyyy-mm-dd) */
  @Column({ type: 'date', nullable: true })
  publishedOn?: string | null;

  @Column({ type: 'int', nullable: true })
  readMinutes?: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  author?: string | null;

  @Column({ type: 'json', nullable: true })
  tone?: Tone | null;

  @Column({ type: 'json', nullable: true })
  content?: PostBlock[] | null;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;
}
