import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollDeduction } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class PayrollDeductionDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.PayrollDeductionCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.PayrollDeductionUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeduction | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.findUnique({ where: { id: params.id } });
  }

  async deleteById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeduction> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.delete({ where: { id: params.id } });
  }

  async findActiveByUserIdAndType(params: {
    userId: number;
    type: string;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollDeduction[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.findMany({
      where: {
        userId: params.userId,
        type: params.type as PayrollDeduction['type'],
        isActive: true,
      },
      orderBy: { effectiveFrom: 'asc' },
    });
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ deductions: PayrollDeduction[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, deductions] = await Promise.all([
      pc.payrollDeduction.count({ where: { userId: params.userId } }),
      pc.payrollDeduction.findMany({
        where: { userId: params.userId },
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { deductions, totalRecords };
  }
}
