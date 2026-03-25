import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollCompensation } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class PayrollCompensationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.PayrollCompensationCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.PayrollCompensationUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findUnique({ where: { id: params.id } });
  }

  async deleteById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.delete({ where: { id: params.id } });
  }

  async findByUserIdOrderedByEffectiveFromDesc(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollCompensation[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findMany({
      where: { userId: params.userId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async updateManyByUserId(params: {
    userId: number;
    data: Prisma.PayrollCompensationUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollCompensation.updateMany({
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
  }): Promise<{ compensations: PayrollCompensation[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, compensations] = await Promise.all([
      pc.payrollCompensation.count({ where: { userId: params.userId } }),
      pc.payrollCompensation.findMany({
        where: { userId: params.userId },
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { compensations, totalRecords };
  }

  async findActiveWithEmployeeInfo(params: {
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ compensations: (PayrollCompensation & { user: { firstname: string; lastname: string; email: string } })[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, compensations] = await Promise.all([
      pc.payrollCompensation.count({ where: { isActive: true } }),
      pc.payrollCompensation.findMany({
        where: { isActive: true },
        include: { user: { select: { firstname: true, lastname: true, email: true } } },
        orderBy: { user: { firstname: 'asc' } },
        take,
        skip,
      }),
    ]);

    return { compensations, totalRecords };
  }
}
