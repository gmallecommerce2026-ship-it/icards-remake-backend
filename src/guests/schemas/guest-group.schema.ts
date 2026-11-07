import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('guest_groups')
@Unique('uq_guest_group_name', ['invitation', 'name'])
export class GuestGroup extends BaseEntity {
  @Index()
  @Column({ type: 'char', length: 24 })
  invitation: string;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color?: string | null;
}
