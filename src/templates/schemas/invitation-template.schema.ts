import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_FORMATS,
  TEMPLATE_MOTIFS,
  TEMPLATE_ORIENTATIONS,
  type TemplateCardLayout,
  type TemplateCategory,
  type TemplateFormat,
  type TemplateMotif,
  type TemplateOrientation,
  type TemplatePalette,
  type TemplateSample,
} from '../../catalog/catalog.types.js';

@Entity('invitation_templates')
export class InvitationTemplate extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index()
  @Column({ type: 'enum', enum: [...TEMPLATE_CATEGORIES] })
  category: TemplateCategory;

  @Column({ type: 'varchar', length: 300 })
  tagline: string;

  @Column({ type: 'text' })
  description: string;

  /** VND, 0 = miễn phí */
  @Column({ type: 'int', default: 0 })
  price: number;

  /** Số lượt dùng, dùng để sắp xếp "Dùng nhiều nhất" */
  @Column({ type: 'int', default: 0 })
  popularity: number;

  /** Ngày phát hành (yyyy-mm-dd); FE dùng làm createdAt cho sắp xếp "Mới nhất" */
  @Column({ type: 'date' })
  releasedOn: string;

  @Column({ type: 'json' })
  features: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  previewImage?: string | null;

  @Column({ type: 'enum', enum: [...TEMPLATE_MOTIFS] })
  motif: TemplateMotif;

  @Column({ type: 'json' })
  palette: TemplatePalette;

  @Column({ type: 'json' })
  sample: TemplateSample;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  /** Kiểu thiệp: folding (gập 5:7, mặc định cho mẫu cũ) hoặc card (2 mặt phẳng). */
  @Index()
  @Column({ type: 'enum', enum: [...TEMPLATE_FORMATS], default: 'folding' })
  format: TemplateFormat;

  /** Kiểu dáng: landscape (ngang), square (vuông), portrait (dọc). Mẫu cũ mặc định portrait (5:7 đứng). */
  @Index()
  @Column({ type: 'enum', enum: [...TEMPLATE_ORIENTATIONS], default: 'portrait' })
  orientation: TemplateOrientation;

  /** Bố cục hai mặt, chỉ có với format = card. Toạ độ theo tỉ lệ, nên không phụ thuộc kích thước pixel. */
  @Column({ type: 'json', nullable: true })
  layout?: TemplateCardLayout | null;
}
