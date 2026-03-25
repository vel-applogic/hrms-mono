import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { OrderByParam } from '../index.js';
import { UserFilterRequestType } from '@repo/dto';
import { userRoleDtoEnumToDbEnum } from '../../util/enum.util.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.UserCreateInput; tx?: Prisma.TransactionClient }): Promise<User> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.UserUpdateInput; tx?: Prisma.TransactionClient }): Promise<User> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.update({ where: { id: params.id }, data: params.data });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<User> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.update({ where: { id: params.id }, data: { isActive: false } });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<User | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.findUnique({ where: { id: params.id } });
  }

  async getByEmail(params: { email: string; tx?: Prisma.TransactionClient }): Promise<User | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.findUnique({ where: { email: params.email } });
  }

  async getCount(params: { where: Prisma.UserWhereInput; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.count({ where: params.where });
  }

  public async search(params: { filterDto: UserFilterRequestType; orderBy?: OrderByParam; organizationId?: number; includeSuperAdmins?: boolean; tx?: Prisma.TransactionClient }): Promise<{ totalRecords: number; dbRecords: User[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.UserWhereInput = {};

    if (params.filterDto.search) {
      where.OR = [
        { email: { contains: params.filterDto.search, mode: 'insensitive' } },
        { firstname: { contains: params.filterDto.search, mode: 'insensitive' } },
        { lastname: { contains: params.filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (params.filterDto.role && params.organizationId) {
      const orgRoleFilter: Prisma.UserWhereInput = {
        organizationHasUsers: {
          some: {
            organizationId: params.organizationId,
            roles: { has: userRoleDtoEnumToDbEnum(params.filterDto.role) },
          },
        },
      };
      where.AND = params.includeSuperAdmins
        ? [{ OR: [{ isSuperAdmin: true }, orgRoleFilter] }]
        : [orgRoleFilter];
    }

    if (params.filterDto.isActive !== undefined) {
      where.isActive = params.filterDto.isActive;
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.user.count({ where }),
      pc.user.findMany({ where, take, skip, orderBy }),
    ]);

    return { dbRecords, totalRecords };
  }
}
