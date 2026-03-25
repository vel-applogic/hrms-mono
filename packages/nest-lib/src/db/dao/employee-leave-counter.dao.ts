import { Injectable } from '@nestjs/common';
import type { Prisma, EmployeeLeaveCounter } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class EmployeeLeaveCounterDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findManyByFinancialYear(params: {
    financialYear: string;
    tx?: Prisma.TransactionClient;
  }): Promise<(EmployeeLeaveCounter & { user: { id: number; firstname: string; lastname: string; email: string } })[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeLeaveCounter.findMany({
      where: { financialYear: params.financialYear },
      include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
      orderBy: { user: { firstname: 'asc' } },
    });
  }

  async findByUserIdAndFinancialYear(params: {
    userId: number;
    financialYear: string;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeLeaveCounter | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeLeaveCounter.findUnique({
      where: {
        userId_financialYear: {
          userId: params.userId,
          financialYear: params.financialYear,
        },
      },
    });
  }

  async create(params: {
    data: Prisma.EmployeeLeaveCounterCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeLeaveCounter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeLeaveCounter.create({ data: params.data });
  }

  async upsert(params: {
    userId: number;
    financialYear: string;
    data: Prisma.EmployeeLeaveCounterCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeLeaveCounter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeLeaveCounter.upsert({
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
  }): Promise<EmployeeLeaveCounter> {
    const totalLeavesAvailable = Math.max(0, params.maxLeaves - params.totalLeavesUsed);
    const data: Prisma.EmployeeLeaveCounterCreateInput = {
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
