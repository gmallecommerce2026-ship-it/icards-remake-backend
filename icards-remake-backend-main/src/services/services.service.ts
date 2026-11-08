import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './schemas/service.schema.js';
import { ServiceRequest } from './schemas/service-request.schema.js';
import type { CreateServiceRequestDto } from './dto/service-request.dto.js';

/** Hình dạng trả về khớp kiểu Service của FE (src/lib/services.ts). */
export const toServiceDto = (s: Service) => ({
  _id: s._id,
  slug: s.slug,
  name: s.name,
  summary: s.summary,
  description: s.description,
  priceFrom: s.priceFrom,
  duration: s.duration,
  audience: s.audience,
  includes: s.includes,
});

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private readonly services: Repository<Service>,
    @InjectRepository(ServiceRequest) private readonly requests: Repository<ServiceRequest>,
  ) {}

  async list() {
    const rows = await this.services.find({
      where: { isPublished: true },
      order: { sortOrder: 'ASC', slug: 'ASC' },
    });
    return rows.map(toServiceDto);
  }

  async findPublished(slug: string) {
    const s = await this.services.findOne({ where: { slug, isPublished: true } });
    if (!s) throw new NotFoundException('Không tìm thấy dịch vụ');
    return toServiceDto(s);
  }

  async createRequest(dto: CreateServiceRequestDto) {
    const exists = await this.services.exists({ where: { slug: dto.service, isPublished: true } });
    if (!exists) throw new BadRequestException('Dịch vụ không tồn tại');
    const row = await this.requests.save(
      this.requests.create({
        serviceSlug: dto.service,
        name: dto.name,
        phone: dto.phone,
        eventDate: dto.eventDate ?? null,
        note: dto.note ?? null,
      }),
    );
    return { _id: row._id, status: row.status, createdAt: row.createdAt };
  }
}
