import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { userRoleDtoEnumToDbEnum } from '../../util/enum.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderByParam } from '../index.js';
import { UserFilterRequestType } from '@repo/dto';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class UserDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: UserInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.user.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('User not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: UserUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.user.update({ where: { id: params.id }, data: params.data });
  }

  public async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.user.update({ where: { id: params.id }, data: { isActive: false } });
  }

  public async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.user.findUnique({ where: { id: params.id } });
    return dbRec ?? undefined;
  }

  public async getByEmail(params: { email: string; tx?: Prisma.TransactionClient }): Promise<UserSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.user.findUnique({ where: { email: params.email } });
    return dbRec ?? undefined;
  }

  public async getCount(params: { where: Prisma.UserWhereInput; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    return pc.user.count({ where: params.where });
  }

  public async search(params: {
    filterDto: UserFilterRequestType;
    orderBy?: OrderByParam;
    organizationId: number;
    includeSuperAdmins?: boolean;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: UserSelectTableRecordType[] }> {
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

    if (params.filterDto.role) {
      const orgRoleFilter: Prisma.UserWhereInput = {
        organizationHasUsers: {
          some: {
            organizationId: params.organizationId,
            roles: { has: userRoleDtoEnumToDbEnum(params.filterDto.role) },
          },
        },
      };
      where.AND = params.includeSuperAdmins ? [{ OR: [{ isSuperAdmin: true }, orgRoleFilter] }] : [orgRoleFilter];
    }

    if (params.filterDto.isActive !== undefined) {
      where.isActive = params.filterDto.isActive;
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([pc.user.count({ where }), pc.user.findMany({ where, take, skip, orderBy })]);

    return { dbRecords, totalRecords };
  }
}

// Type definitions
type UserSelectTableRecordType = Prisma.UserGetPayload<{}>;
type UserInsertTableRecordType = Prisma.UserCreateInput;
type UserUpdateTableRecordType = Prisma.UserUpdateInput;

export type { UserSelectTableRecordType };
