import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserEmployeeDetail } from '@repo/db';
import { EmployeeStatusEnum } from '@repo/db';
import type { EmployeeFilterRequestType } from '@repo/dto';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class UserEmployeeDetailDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDetail.findUnique({
      where: { userId: params.userId },
      include: {
        user: true,
        reportTo: { select: { id: true, firstname: true, lastname: true, email: true } },
      },
    });
  }

  async create(params: { data: Prisma.UserEmployeeDetailCreateInput; tx?: Prisma.TransactionClient }): Promise<UserEmployeeDetail> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDetail.create({ data: params.data });
  }

  async update(params: {
    userId: number;
    data: Prisma.UserEmployeeDetailUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeDetail> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDetail.update({ where: { userId: params.userId }, data: params.data });
  }

  async search(params: {
    filterDto: EmployeeFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: EmployeeListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    });

    const where: Prisma.UserEmployeeDetailWhereInput = {};

    if (params.filterDto.search) {
      where.user = {
        OR: [
          { firstname: { contains: params.filterDto.search, mode: 'insensitive' } },
          { lastname: { contains: params.filterDto.search, mode: 'insensitive' } },
          { email: { contains: params.filterDto.search, mode: 'insensitive' } },
        ],
      };
    }

    if (params.filterDto.status?.length) {
      where.status = { in: params.filterDto.status as unknown as EmployeeStatusEnum[] };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.userEmployeeDetail.count({ where }),
      pc.userEmployeeDetail.findMany({
        where,
        include: { user: true },
        take,
        skip,
        orderBy: params.orderBy ?? { createdAt: 'desc' },
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

export type EmployeeListRecordType = Prisma.UserEmployeeDetailGetPayload<{
  include: { user: true };
}>;
export type EmployeeDetailRecordType = Prisma.UserEmployeeDetailGetPayload<{
  include: {
    user: true;
    reportTo: { select: { id: true; firstname: true; lastname: true; email: true } };
  };
}>;
