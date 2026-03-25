import { Injectable } from '@nestjs/common';
import type { Prisma, EmployeeFeedback } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class EmployeeFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.EmployeeFeedbackCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.EmployeeFeedbackUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.update({ where: { id: params.id }, data: params.data });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.delete({ where: { id: params.id } });
  }

  async getById(params: {
    id: number;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeFeedbackWithCreatedByType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.findUnique({
      where: { id: params.id },
      include: { createdBy: true },
    });
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ feedbacks: EmployeeFeedbackWithCreatedByType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, feedbacks] = await Promise.all([
      pc.employeeFeedback.count({ where: { userId: params.userId } }),
      pc.employeeFeedback.findMany({
        where: { userId: params.userId },
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { feedbacks, totalRecords };
  }
}

export type EmployeeFeedbackWithCreatedByType = Prisma.EmployeeFeedbackGetPayload<{
  include: { createdBy: true };
}>;
