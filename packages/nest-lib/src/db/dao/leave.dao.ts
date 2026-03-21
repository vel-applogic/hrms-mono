import { Injectable } from '@nestjs/common';
import type { Prisma, Leave } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class LeaveDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.LeaveCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<Leave> {
    const pc = this.getPrismaClient(params.tx);
    return pc.leave.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.LeaveUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<Leave> {
    const pc = this.getPrismaClient(params.tx);
    return pc.leave.update({ where: { id: params.id }, data: params.data });
  }

  async getById(params: {
    id: number;
    tx?: Prisma.TransactionClient;
  }): Promise<LeaveWithUserType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.leave.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
    });
  }

  async findManyWithPagination(params: {
    where?: Prisma.LeaveWhereInput;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ leaves: LeaveWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, leaves] = await Promise.all([
      pc.leave.count({ where: params.where }),
      pc.leave.findMany({
        where: params.where,
        include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { leaves, totalRecords };
  }

  async getApprovedLeaveTotalsByUserIdAndDateRange(params: {
    userId: number;
    startDate: Date;
    endDate: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<{ casualLeaves: number; sickLeaves: number; earnedLeaves: number; totalLeavesUsed: number }> {
    const pc = this.getPrismaClient(params.tx);
    const leaves = await pc.leave.findMany({
      where: {
        userId: params.userId,
        status: 'approved',
        startDate: { gte: params.startDate, lte: params.endDate },
      },
      select: { leaveType: true, numberOfDays: true },
    });

    const totals = { casualLeaves: 0, sickLeaves: 0, earnedLeaves: 0 };
    for (const l of leaves) {
      const days = l.numberOfDays;
      if (l.leaveType === 'casual') totals.casualLeaves += days;
      else if (l.leaveType === 'sick' || l.leaveType === 'medical') totals.sickLeaves += days;
      else if (l.leaveType === 'earned') totals.earnedLeaves += days;
    }
    return {
      ...totals,
      totalLeavesUsed: totals.casualLeaves + totals.sickLeaves + totals.earnedLeaves,
    };
  }

  async sumDaysByUserIdAndStatus(params: {
    userId: number;
    statuses: string[];
    leaveType?: string;
    excludeLeaveId?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.leave.aggregate({
      where: {
        userId: params.userId,
        status: { in: params.statuses as ('pending' | 'approved')[] },
        ...(params.leaveType ? { leaveType: params.leaveType as 'casual' | 'sick' | 'medical' | 'earned' } : {}),
        ...(params.excludeLeaveId ? { id: { not: params.excludeLeaveId } } : {}),
      },
      _sum: { numberOfDays: true },
    });
    return result._sum.numberOfDays ?? 0;
  }

  async sumLopDaysByUserIdAndDateRange(params: {
    userId: number;
    startDate: Date;
    endDate: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.leave.aggregate({
      where: {
        userId: params.userId,
        status: 'approved',
        startDate: { gte: params.startDate, lte: params.endDate },
      },
      _sum: { numberOfLopDays: true },
    });
    return result._sum.numberOfLopDays ?? 0;
  }
}

export type LeaveWithUserType = Prisma.LeaveGetPayload<{
  include: { user: { select: { id: true; firstname: true; lastname: true; email: true } } };
}>;
