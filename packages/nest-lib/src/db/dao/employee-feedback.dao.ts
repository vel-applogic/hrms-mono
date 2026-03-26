import { Injectable } from '@nestjs/common';
import type { Prisma, EmployeeFeedback } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class EmployeeFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.EmployeeFeedbackCreateInput; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.create({ data: params.data });
  }

  async update(params: { id: number; organizationId: number; data: Prisma.EmployeeFeedbackUpdateInput; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  async delete(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedbackWithCreatedByType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeFeedback.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: { createdBy: true },
    });
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ feedbacks: EmployeeFeedbackWithCreatedByType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where = {
      userId: params.userId,
      organizationId: params.organizationId,
    };

    const [totalRecords, feedbacks] = await Promise.all([
      pc.employeeFeedback.count({ where }),
      pc.employeeFeedback.findMany({
        where,
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
