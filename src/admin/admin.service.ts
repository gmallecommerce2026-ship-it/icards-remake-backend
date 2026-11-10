import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from '../users/schemas/user.schema.js';
import { toPublicUser } from '../users/users.service.js';
import { Invitation } from '../invitations/schemas/invitation.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';
import { ServiceRequest } from '../services/schemas/service-request.schema.js';
import type { AdminInvitationsQueryDto, AdminUsersQueryDto, UpdateUserAdminDto } from './dto/admin.dto.js';

const adminUser = (u: User) => ({ ...toPublicUser(u), isActive: u.isActive });

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Invitation) private readonly invitations: Repository<Invitation>,
    @InjectRepository(Wish) private readonly wishes: Repository<Wish>,
    @InjectRepository(ServiceRequest) private readonly serviceRequests: Repository<ServiceRequest>,
  ) {}

  async stats() {
    const [users, admins, inactiveUsers, invitations, publishedInvitations, pendingWishes, serviceRequests] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { role: 'admin' } }),
      this.users.count({ where: { isActive: false } }),
      this.invitations.count(),
      this.invitations.count({ where: { status: 'published' } }),
      this.wishes.count({ where: { isApproved: false } }),
      this.serviceRequests.count(),
    ]);
    return { users, admins, inactiveUsers, invitations, publishedInvitations, pendingWishes, serviceRequests };
  }

  async listUsers(q: AdminUsersQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const qb = this.users.createQueryBuilder('u').orderBy('u.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    if (q.search) qb.andWhere('(u.username LIKE :s OR u.email LIKE :s OR u.fullName LIKE :s)', { s: `%${q.search}%` });
    if (q.role) qb.andWhere('u.role = :role', { role: q.role });
    const [items, total] = await qb.getManyAndCount();
    return { items: items.map(adminUser), total, page, limit };
  }

  async updateUser(actorId: string, id: string, dto: UpdateUserAdminDto) {
    if (id === actorId && (dto.role === 'user' || dto.isActive === false)) {
      throw new BadRequestException('Không thể tự hạ quyền hoặc khoá tài khoản đang đăng nhập');
    }
    const u = await this.users.findOne({ where: { _id: id } });
    if (!u) throw new NotFoundException('Không tìm thấy người dùng');
    if (dto.role !== undefined) u.role = dto.role;
    if (dto.isActive !== undefined) u.isActive = dto.isActive;
    await this.users.save(u);
    return adminUser(u);
  }

  async listInvitations(q: AdminInvitationsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.search ? { title: Like(`%${q.search}%`) } : {}),
    };
    const [rows, total] = await this.invitations.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const ownerIds = [...new Set(rows.map((r) => r.owner))];
    const owners = ownerIds.length
      ? await this.users.find({ where: { _id: In(ownerIds) }, select: ['_id', 'username', 'email'] })
      : [];
    const byId = new Map(owners.map((o) => [o._id, { _id: o._id, username: o.username, email: o.email }]));
    const items = rows.map((i) => ({
      _id: i._id,
      title: i.title,
      slug: i.slug,
      eventType: i.eventType,
      status: i.status,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      owner: byId.get(i.owner) ?? { _id: i.owner, username: null, email: null },
    }));
    return { items, total, page, limit };
  }
}
