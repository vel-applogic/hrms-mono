import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollDeduction, PayrollDeductionType } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class PayrollDeductionDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: PayrollDeductionInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.payrollDeduction.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('PayrollDeduction not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: PayrollDeductionUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollDeduction.update({ where: { id: params.id }, data: params.data });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeductionSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollDeduction.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    return result ?? undefined;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.payrollDeduction.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('PayrollDeduction not found');
    }
    await pc.payrollDeduction.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async findActiveByUserIdAndType(params: { userId: number; organizationId: number; type: PayrollDeductionType; tx?: Prisma.TransactionClient }): Promise<PayrollDeduction[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.findMany({
      where: {
        userId: params.userId,
        type: params.type,
        isActive: true,
        organizationId: params.organizationId,
      },
      orderBy: { effectiveFrom: 'asc' },
    });
  }

  public async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: PayrollDeduction[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where = {
      userId: params.userId,
      organizationId: params.organizationId,
    };

    const [totalRecords, dbRecords] = await Promise.all([
      pc.payrollDeduction.count({ where }),
      pc.payrollDeduction.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

// Base table record types
type PayrollDeductionSelectTableRecordType = Prisma.PayrollDeductionGetPayload<{}>;
type PayrollDeductionInsertTableRecordType = Prisma.PayrollDeductionCreateInput;
type PayrollDeductionUpdateTableRecordType = Prisma.PayrollDeductionUpdateInput;
