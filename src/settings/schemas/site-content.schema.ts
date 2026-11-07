import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Danh mục và nội dung cấu hình nhỏ (nhãn danh mục, các bước quy trình, gói dịch vụ...).
 * Khóa là chuỗi có dấu chấm, vd "templates.categories". Xem PUBLIC_CONTENT_KEYS.
 */
@Entity('site_content')
export class SiteContent {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'json' })
  value: unknown;

  @UpdateDateColumn()
  updatedAt: Date;
}
