import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class ExpenseForecastDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: ExpenseForecastInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.expenseForecast.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Expense forecast not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: ExpenseForecastUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.expenseForecast.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.expenseForecast.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Expense forecast not found');
    }
    await pc.expenseForecast.delete({ where: { id: params.id } });
  }

  public async findAllByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<ExpenseForecastSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.expenseForecast.findMany({
      where: { organizationId: params.organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async deleteByOrganizationIdExcluding(params: {
    organizationId: number;
    excludeIds: number[];
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.expenseForecast.deleteMany({
      where: {
        organizationId: params.organizationId,
        id: { notIn: params.excludeIds },
      },
    });
  }
}

// Base table record types
type ExpenseForecastSelectTableRecordType = Prisma.ExpenseForecastGetPayload<{}>;
type ExpenseForecastInsertTableRecordType = Prisma.ExpenseForecastCreateInput;
type ExpenseForecastUpdateTableRecordType = Prisma.ExpenseForecastUpdateInput;

export type { ExpenseForecastSelectTableRecordType };
