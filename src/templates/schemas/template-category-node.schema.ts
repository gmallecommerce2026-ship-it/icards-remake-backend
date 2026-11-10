import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

/**
 * Một nút trong cây danh mục mẫu thiệp (danh mục gốc → nhóm → nhóm con).
 * Cây được lưu phẳng theo parentId; keyPath là đường đi từ gốc (vd 'wedding/wedding-style/wedding-classic')
 * để lọc theo nhóm cha bằng so khớp tiền tố, không cần đệ quy.
 */
@Entity('template_category_nodes')
export class TemplateCategoryNode extends BaseEntity {
  /** Mã nút dùng trên URL và trong dữ liệu seed, vd 'wedding' hoặc 'wedding-style'. Duy nhất. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  label: string;

  /** _id của nút cha; null với danh mục gốc. */
  @Index()
  @Column({ type: 'char', length: 24, nullable: true })
  parentId?: string | null;

  /** Đường đi từ gốc, các slug nối bằng '/'. */
  @Index()
  @Column({ type: 'varchar', length: 500 })
  keyPath: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
