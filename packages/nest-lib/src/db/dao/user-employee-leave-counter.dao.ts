import { Injectable } from '@nestjs/common';
import type { Prisma, UserEmployeeLeaveCounter } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserEmployeeLeaveCounterDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findManyByFinancialYear(params: {
    financialYear: string;
    tx?: Prisma.TransactionClient;
  }): Promise<(UserEmployeeLeaveCounter & { user: { id: number; firstname: string; lastname: string; email: string } })[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeLeaveCounter.findMany({
      where: { financialYear: params.financialYear },
      include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
      orderBy: { user: { firstname: 'asc' } },
    });
  }

  async findByUserIdAndFinancialYear(params: {
    userId: number;
    financialYear: string;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeLeaveCounter | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeLeaveCounter.findUnique({
      where: {
        userId_financialYear: {
          userId: params.userId,
          financialYear: params.financialYear,
        },
      },
    });
  }

  async create(params: {
    data: Prisma.UserEmployeeLeaveCounterCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeLeaveCounter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeLeaveCounter.create({ data: params.data });
  }

  async upsert(params: {
    userId: number;
    financialYear: string;
    data: Prisma.UserEmployeeLeaveCounterCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeLeaveCounter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeLeaveCounter.upsert({
      where: {
        userId_financialYear: {
          userId: params.userId,
          financialYear: params.financialYear,
        },
      },
      create: params.data,
      update: params.data,
    });
  }

  /**
   * Sync counter from actual approved leaves in the database.
   * Recomputes casualLeaves, sickLeaves, earnedLeaves, totalLeavesUsed, totalLeavesAvailable.
   */
  async syncFromActualLeaves(params: {
    userId: number;
    financialYear: string;
    casualLeaves: number;
    sickLeaves: number;
    earnedLeaves: number;
    totalLeavesUsed: number;
    maxLeaves: number;
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeLeaveCounter> {
    const totalLeavesAvailable = Math.max(0, params.maxLeaves - params.totalLeavesUsed);
    const data: Prisma.UserEmployeeLeaveCounterCreateInput = {
      user: { connect: { id: params.userId } },
      financialYear: params.financialYear,
      casualLeaves: params.casualLeaves,
      sickLeaves: params.sickLeaves,
      earnedLeaves: params.earnedLeaves,
      totalLeavesUsed: params.totalLeavesUsed,
      totalLeavesAvailable,
    };
    return this.upsert({
      userId: params.userId,
      financialYear: params.financialYear,
      data,
      tx: params.tx,
    });
  }
}
