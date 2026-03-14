import { Injectable } from '@nestjs/common';
import type { Prisma, UserPlanHistory } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserPlanHistoryDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.UserPlanHistoryCreateInput; tx?: Prisma.TransactionClient }): Promise<UserPlanHistory> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userPlanHistory.create({ data: params.data });
  }

  async getByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<UserPlanHistory[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userPlanHistory.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<UserPlanHistory | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userPlanHistory.findFirst({
      where: {
        userId: params.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
