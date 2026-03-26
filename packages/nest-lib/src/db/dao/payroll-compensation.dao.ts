import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollCompensation } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class PayrollCompensationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.PayrollCompensationCreateInput; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.PayrollCompensationUpdateInput; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  async deleteById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  async findByUserIdOrderedByEffectiveFromDesc(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async updateManyByUserId(params: { userId: number; organizationId: number; data: Prisma.PayrollCompensationUpdateInput; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollCompensation.updateMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      data: params.data,
    });
    return result.count;
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ compensations: PayrollCompensation[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where = {
      userId: params.userId,
      organizationId: params.organizationId,
    };

    const [totalRecords, compensations] = await Promise.all([
      pc.payrollCompensation.count({ where }),
      pc.payrollCompensation.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { compensations, totalRecords };
  }

  async findActiveWithEmployeeInfo(params: {
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ compensations: (PayrollCompensation & { user: { firstname: string; lastname: string; email: string } })[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where = {
      isActive: true,
      organizationId: params.organizationId,
    };

    const [totalRecords, compensations] = await Promise.all([
      pc.payrollCompensation.count({ where }),
      pc.payrollCompensation.findMany({
        where,
        include: { user: { select: { firstname: true, lastname: true, email: true } } },
        orderBy: { user: { firstname: 'asc' } },
        take,
        skip,
      }),
    ]);

    return { compensations, totalRecords };
  }
}
