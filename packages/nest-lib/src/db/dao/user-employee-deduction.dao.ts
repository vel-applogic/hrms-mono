import { Injectable } from '@nestjs/common';
import type { Prisma, UserEmployeeDeduction } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserEmployeeDeductionDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.UserEmployeeDeductionCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDeduction.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.UserEmployeeDeductionUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDeduction.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserEmployeeDeduction | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDeduction.findUnique({ where: { id: params.id } });
  }

  async deleteById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserEmployeeDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeDeduction.delete({ where: { id: params.id } });
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ deductions: UserEmployeeDeduction[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, deductions] = await Promise.all([
      pc.userEmployeeDeduction.count({ where: { userId: params.userId } }),
      pc.userEmployeeDeduction.findMany({
        where: { userId: params.userId },
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { deductions, totalRecords };
  }
}
