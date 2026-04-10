import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ExpenseFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class ExpenseDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: ExpenseInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.expense.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Expense not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: ExpenseUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.expense.update({ where: { id: params.id }, data: params.data });
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<ExpenseSelectTableRecordType> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.expense.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!result) {
      throw new DbRecordNotFoundError('Expense not found');
    }
    return result;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.expense.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Expense not found');
    }
    await pc.expense.delete({ where: { id: params.id } });
  }

  public async search(params: {
    organizationId: number;
    page: number;
    limit: number;
    search?: string;
    filterDto: ExpenseFilterRequestType;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: ExpenseSelectTableRecordType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where: Prisma.ExpenseWhereInput = {
      organizationId: params.organizationId,
    };

    if (params.search?.trim()) {
      where.description = { contains: params.search.trim(), mode: 'insensitive' };
    }

    if (params.filterDto.types && params.filterDto.types.length > 0) {
      where.type = { in: params.filterDto.types };
    }

    if (params.filterDto.dateStartDate) {
      where.date = { ...((where.date as Prisma.DateTimeFilter) ?? {}), gte: new Date(params.filterDto.dateStartDate) };
    }

    if (params.filterDto.dateEndDate) {
      where.date = { ...((where.date as Prisma.DateTimeFilter) ?? {}), lte: new Date(params.filterDto.dateEndDate) };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.expense.count({ where }),
      pc.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async getSummary(params: {
    organizationId: number;
    thisMonthStart: Date;
    thisMonthEnd: Date;
    financialYearStart: Date;
    financialYearEnd: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<{ thisMonthTotal: number; financialYearTotal: number }> {
    const pc = this.getPrismaClient(params.tx);

    const [thisMonthResult, financialYearResult] = await Promise.all([
      pc.expense.aggregate({
        where: {
          organizationId: params.organizationId,
          date: { gte: params.thisMonthStart, lte: params.thisMonthEnd },
        },
        _sum: { amount: true },
      }),
      pc.expense.aggregate({
        where: {
          organizationId: params.organizationId,
          date: { gte: params.financialYearStart, lte: params.financialYearEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      thisMonthTotal: thisMonthResult._sum.amount ?? 0,
      financialYearTotal: financialYearResult._sum.amount ?? 0,
    };
  }
}

// Base table record types
type ExpenseSelectTableRecordType = Prisma.ExpenseGetPayload<{}>;
type ExpenseInsertTableRecordType = Prisma.ExpenseCreateInput;
type ExpenseUpdateTableRecordType = Prisma.ExpenseUpdateInput;

export type { ExpenseSelectTableRecordType };
