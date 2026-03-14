import { Injectable } from '@nestjs/common';
import type { Prisma, UserEmployeeFeedback } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserEmployeeFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.UserEmployeeFeedbackCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeFeedback.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.UserEmployeeFeedbackUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeFeedback.update({ where: { id: params.id }, data: params.data });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserEmployeeFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeFeedback.delete({ where: { id: params.id } });
  }

  async getById(params: {
    id: number;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeFeedbackWithCreatedByType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeFeedback.findUnique({
      where: { id: params.id },
      include: { createdBy: true },
    });
  }

  async findByUserIdWithPagination(params: {
    userId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ feedbacks: UserEmployeeFeedbackWithCreatedByType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, feedbacks] = await Promise.all([
      pc.userEmployeeFeedback.count({ where: { userId: params.userId } }),
      pc.userEmployeeFeedback.findMany({
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

export type UserEmployeeFeedbackWithCreatedByType = Prisma.UserEmployeeFeedbackGetPayload<{
  include: { createdBy: true };
}>;
