import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class HolidayDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: HolidayInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.holiday.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Holiday not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: HolidayUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.holiday.update({ where: { id: params.id }, data: params.data });
  }

  public async getByIdOrThrow(params: { id: number; organisationId: number; tx?: Prisma.TransactionClient }): Promise<HolidaySelectTableRecordType> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.holiday.findFirst({
      where: { id: params.id, organisationId: params.organisationId },
    });
    if (!result) {
      throw new DbRecordNotFoundError('Holiday not found');
    }
    return result;
  }

  public async deleteByIdOrThrow(params: { id: number; organisationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.holiday.findFirst({
      where: { id: params.id, organisationId: params.organisationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Holiday not found');
    }
    await pc.holiday.delete({ where: { id: params.id } });
  }

  public async search(params: {
    organisationId: number;
    page: number;
    limit: number;
    search?: string;
    year?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: HolidaySelectTableRecordType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where: Prisma.HolidayWhereInput = {
      organisationId: params.organisationId,
    };

    if (params.search?.trim()) {
      where.name = { contains: params.search.trim(), mode: 'insensitive' };
    }

    if (params.year) {
      where.date = {
        gte: new Date(`${params.year}-01-01`),
        lt: new Date(`${params.year + 1}-01-01`),
      };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.holiday.count({ where }),
      pc.holiday.findMany({
        where,
        orderBy: { date: 'asc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async findByDateRange(params: {
    organisationId: number;
    startDate: Date;
    endDate: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<HolidaySelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.holiday.findMany({
      where: {
        organisationId: params.organisationId,
        date: { gte: params.startDate, lte: params.endDate },
      },
    });
  }

  public async getDistinctYears(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<number[]> {
    const pc = this.getPrismaClient(params.tx);
    const results = await pc.$queryRaw<Array<{ year: number }>>`
      SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year
      FROM holiday
      WHERE organisation_id = ${params.organisationId}
      ORDER BY year DESC
    `;
    return results.map((r) => r.year);
  }
}

// Base table record types
type HolidaySelectTableRecordType = Prisma.HolidayGetPayload<{}>;
type HolidayInsertTableRecordType = Prisma.HolidayCreateInput;
type HolidayUpdateTableRecordType = Prisma.HolidayUpdateInput;

export type { HolidaySelectTableRecordType };
