import { Injectable } from '@nestjs/common';
import type { Prisma, UserEmployeeCompensation } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserEmployeeCompensationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.UserEmployeeCompensationCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeCompensation.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.UserEmployeeCompensationUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeCompensation.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserEmployeeCompensation | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeCompensation.findUnique({ where: { id: params.id } });
  }

  async updateManyByUserId(params: {
    userId: number;
    data: Prisma.UserEmployeeCompensationUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.userEmployeeCompensation.updateMany({
      where: { userId: params.userId },
      data: params.data,
    });
    return result.count;
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ compensations: UserEmployeeCompensation[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, compensations] = await Promise.all([
      pc.userEmployeeCompensation.count({ where: { userId: params.userId } }),
      pc.userEmployeeCompensation.findMany({
        where: { userId: params.userId },
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { compensations, totalRecords };
  }
}
