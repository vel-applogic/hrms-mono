import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollDeductionLineItem, PayrollDeductionType, PayrollDeductionFrequency } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

const lineItemsInclude = { payrollDeductionLineItems: true } as const;

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

  public async replaceLineItems(params: {
    deductionId: number;
    lineItems: Array<{ type: PayrollDeductionType; frequency: PayrollDeductionFrequency; amount: number; otherTitle?: string | null; specificMonth?: Date | null }>;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollDeductionLineItem.deleteMany({ where: { payrollDeductionId: params.deductionId } });
    await pc.payrollDeductionLineItem.createMany({
      data: params.lineItems.map((item) => ({
        payrollDeductionId: params.deductionId,
        type: item.type,
        frequency: item.frequency,
        amount: item.amount,
        otherTitle: item.otherTitle ?? null,
        specificMonth: item.specificMonth ?? null,
      })),
    });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeductionWithLineItemsType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollDeduction.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
      include: lineItemsInclude,
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
    await pc.payrollDeductionLineItem.deleteMany({ where: { payrollDeductionId: params.id } });
    await pc.payrollDeduction.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async findActiveByUserId(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeductionWithLineItemsType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.findMany({
      where: {
        userId: params.userId,
        isActive: true,
        organizationId: params.organizationId,
      },
      include: lineItemsInclude,
      orderBy: { effectiveFrom: 'asc' },
    });
  }

  public async findByUserIdOrderedByEffectiveFromDesc(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollDeductionWithLineItemsType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollDeduction.findMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      include: lineItemsInclude,
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  public async updateManyByUserId(params: { userId: number; organizationId: number; data: PayrollDeductionUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollDeduction.updateMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      data: params.data,
    });
    return result.count;
  }

  public async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: PayrollDeductionWithLineItemsType[]; totalRecords: number }> {
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
        include: lineItemsInclude,
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async findDistinctUserIds(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<number[]> {
    const pc = this.getPrismaClient(params.tx);
    const results = await pc.payrollDeduction.findMany({
      where: { organizationId: params.organizationId },
      select: { userId: true },
      distinct: ['userId'],
    });
    return results.map((r) => r.userId);
  }
}

// Base table record types
type PayrollDeductionSelectTableRecordType = Prisma.PayrollDeductionGetPayload<{}>;
type PayrollDeductionInsertTableRecordType = Prisma.PayrollDeductionCreateInput;
type PayrollDeductionUpdateTableRecordType = Prisma.PayrollDeductionUpdateInput;

// Return types extending Prisma types
export type PayrollDeductionWithLineItemsType = PayrollDeductionSelectTableRecordType & {
  payrollDeductionLineItems: PayrollDeductionLineItem[];
};
