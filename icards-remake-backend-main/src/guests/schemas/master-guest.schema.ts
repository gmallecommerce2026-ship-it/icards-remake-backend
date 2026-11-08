import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

/** "Danh bạ" khách mời của một chủ thiệp, dùng chung giữa các thiệp. */
@Entity('master_guests')
@Index(['owner', 'email'], { unique: true })
@Index(['owner', 'phone'], { unique: true })
export class MasterGuest extends BaseEntity {
  @Index()
  @Column({ type: 'char', length: 24 })
  owner: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  groupName?: string | null;
}
