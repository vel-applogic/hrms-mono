import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { LeaveStatusEnum, LeaveTypeEnum } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class LeaveDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: LeaveInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.leave.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Leave not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: LeaveUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.leave.update({ where: { id: params.id, organizationId: params.organizationId }, data: params.data });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<LeaveWithUserType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.leave.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
    });
    return result ?? undefined;
  }

  public async findManyWithPagination(params: {
    organizationId: number;
    where?: Prisma.LeaveWhereInput;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: LeaveWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });
    const where: Prisma.LeaveWhereInput = {
      organizationId: params.organizationId,
      ...params.where,
    };

    const [totalRecords, dbRecords] = await Promise.all([
      pc.leave.count({ where }),
      pc.leave.findMany({
        where,
        include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async getApprovedLeaveTotalsByUserIdAndDateRange(params: {
    userId: number;
    organizationId: number;
    startDate: Date;
    endDate: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<{ casualLeaves: number; sickLeaves: number; earnedLeaves: number; totalLeavesUsed: number }> {
    const pc = this.getPrismaClient(params.tx);
    const leaves = await pc.leave.findMany({
      where: {
        userId: params.userId,
        status: LeaveStatusEnum.approved,
        startDate: { gte: params.startDate, lte: params.endDate },
        organizationId: params.organizationId,
      },
      select: { leaveType: true, numberOfDays: true },
    });

    const totals = { casualLeaves: 0, sickLeaves: 0, earnedLeaves: 0 };
    for (const l of leaves) {
      const days = l.numberOfDays;
      if (l.leaveType === LeaveTypeEnum.casual) totals.casualLeaves += days;
      else if (l.leaveType === LeaveTypeEnum.sick || l.leaveType === LeaveTypeEnum.medical) totals.sickLeaves += days;
      else if (l.leaveType === LeaveTypeEnum.earned) totals.earnedLeaves += days;
    }
    return {
      ...totals,
      totalLeavesUsed: totals.casualLeaves + totals.sickLeaves + totals.earnedLeaves,
    };
  }

  public async sumDaysByUserIdAndStatus(params: {
    userId: number;
    organizationId: number;
    statuses: LeaveStatusEnum[];
    leaveType?: LeaveTypeEnum;
    excludeLeaveId?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.leave.aggregate({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
        status: { in: params.statuses },
        ...(params.leaveType ? { leaveType: params.leaveType } : {}),
        ...(params.excludeLeaveId ? { id: { not: params.excludeLeaveId } } : {}),
      },
      _sum: { numberOfDays: true },
    });
    return result._sum.numberOfDays ?? 0;
  }

  public async sumLopDaysByUserIdAndDateRange(params: { userId: number; organizationId: number; startDate: Date; endDate: Date; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.leave.aggregate({
      where: {
        userId: params.userId,
        status: LeaveStatusEnum.approved,
        startDate: { gte: params.startDate, lte: params.endDate },
        organizationId: params.organizationId,
      },
      _sum: { numberOfLopDays: true },
    });
    return result._sum.numberOfLopDays ?? 0;
  }
}

// Base table record types
type LeaveInsertTableRecordType = Prisma.LeaveCreateInput;
type LeaveUpdateTableRecordType = Prisma.LeaveUpdateInput;

// Return types
export type LeaveWithUserType = Prisma.LeaveGetPayload<{
  include: { user: { select: { id: true; firstname: true; lastname: true; email: true } } };
}>;
