import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { SERVICE_REQUEST_STATUSES, type ServiceRequestStatus } from '../../catalog/catalog.types.js';

/** Yêu cầu tư vấn/đặt dịch vụ gửi từ trang dịch vụ. */
@Entity('service_requests')
export class ServiceRequest extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100 })
  serviceSlug: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'date', nullable: true })
  eventDate?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note?: string | null;

  @Index()
  @Column({ type: 'enum', enum: [...SERVICE_REQUEST_STATUSES], default: 'new' })
  status: ServiceRequestStatus;
}
