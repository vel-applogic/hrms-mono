import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class EmployeeLeaveCounterDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findManyByFinancialYear(params: {
    financialYear: string;
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeLeaveCounterWithUserType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeLeaveCounter.findMany({
      where: {
        financialYear: params.financialYear,
        organizationId: params.organizationId,
      },
      include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
      orderBy: { user: { firstname: 'asc' } },
    });
  }

  public async findByUserIdAndFinancialYear(params: {
    userId: number;
    financialYear: string;
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeLeaveCounterSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.employeeLeaveCounter.findUnique({
      where: {
        userId_organizationId_financialYear: {
          userId: params.userId,
          organizationId: params.organizationId,
          financialYear: params.financialYear,
        },
      },
    });
    return result ?? undefined;
  }

  public async create(params: {
    data: EmployeeLeaveCounterInsertTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.employeeLeaveCounter.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Employee leave counter not created');
    }
    return created.id;
  }

  public async upsert(params: {
    userId: number;
    financialYear: string;
    organizationId: number;
    data: EmployeeLeaveCounterInsertTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.employeeLeaveCounter.upsert({
      where: {
        userId_organizationId_financialYear: {
          userId: params.userId,
          organizationId: params.organizationId,
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
  public async syncFromActualLeaves(params: {
    userId: number;
    organizationId: number;
    financialYear: string;
    casualLeaves: number;
    sickLeaves: number;
    earnedLeaves: number;
    totalLeavesUsed: number;
    maxLeaves: number;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const totalLeavesAvailable = Math.max(0, params.maxLeaves - params.totalLeavesUsed);
    const data: EmployeeLeaveCounterInsertTableRecordType = {
      user: { connect: { id: params.userId } },
      organization: { connect: { id: params.organizationId } },
      financialYear: params.financialYear,
      casualLeaves: params.casualLeaves,
      sickLeaves: params.sickLeaves,
      earnedLeaves: params.earnedLeaves,
      totalLeavesUsed: params.totalLeavesUsed,
      totalLeavesAvailable,
    };
    await this.upsert({
      userId: params.userId,
      financialYear: params.financialYear,
      organizationId: params.organizationId,
      data,
      tx: params.tx,
    });
  }
}

// Base table record types
type EmployeeLeaveCounterSelectTableRecordType = Prisma.EmployeeLeaveCounterGetPayload<{}>;
type EmployeeLeaveCounterInsertTableRecordType = Prisma.EmployeeLeaveCounterCreateInput;

// Return types
export type EmployeeLeaveCounterWithUserType = Prisma.EmployeeLeaveCounterGetPayload<{
  include: { user: { select: { id: true; firstname: true; lastname: true; email: true } } };
}>;
