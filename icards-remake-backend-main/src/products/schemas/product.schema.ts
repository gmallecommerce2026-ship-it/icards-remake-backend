import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import {
  SHIPPING_KINDS,
  SHOP_CATEGORY_IDS,
  THUMB_KINDS,
  type LabeledValue,
  type ProductVariant,
  type ShippingKind,
  type ShopCategory,
  type ThumbKind,
  type Tone,
} from '../../catalog/catalog.types.js';

@Entity('products')
export class Product extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Index()
  @Column({ type: 'enum', enum: [...SHOP_CATEGORY_IDS] })
  category: ShopCategory;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  summary: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: [...THUMB_KINDS] })
  thumb: ThumbKind;

  @Column({ type: 'json' })
  tone: Tone;

  @Column({ type: 'json' })
  variants: ProductVariant[];

  @Column({ type: 'enum', enum: [...SHIPPING_KINDS] })
  shipping: ShippingKind;

  @Column({ type: 'varchar', length: 200 })
  leadTime: string;

  @Column({ type: 'json' })
  highlights: string[];

  @Column({ type: 'json' })
  specs: LabeledValue[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;
}
