import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollCompensationLineItem } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

const lineItemsInclude = { payrollCompensationLineItems: true } as const;

@Injectable()
@TrackQuery()
export class PayrollCompensationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: PayrollCompensationInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.payrollCompensation.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('PayrollCompensation not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: PayrollCompensationUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollCompensation.update({ where: { id: params.id }, data: params.data });
  }

  public async replaceLineItems(params: {
    compensationId: number;
    lineItems: Array<{ title: string; amount: number }>;
    grossAmount: number;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollCompensationLineItem.deleteMany({ where: { payrollCompensationId: params.compensationId } });
    await pc.payrollCompensationLineItem.createMany({
      data: params.lineItems.map((item) => ({
        payrollCompensationId: params.compensationId,
        title: item.title,
        amount: item.amount,
      })),
    });
    await pc.payrollCompensation.update({
      where: { id: params.compensationId },
      data: { grossAmount: params.grossAmount },
    });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensationWithLineItemsType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollCompensation.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
      include: lineItemsInclude,
    });
    return result ?? undefined;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.payrollCompensation.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('PayrollCompensation not found');
    }
    await pc.payrollCompensationLineItem.deleteMany({ where: { payrollCompensationId: params.id } });
    await pc.payrollCompensation.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async findByUserIdOrderedByEffectiveFromDesc(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensationWithLineItemsType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      include: lineItemsInclude,
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  public async updateManyByUserId(params: { userId: number; organizationId: number; data: PayrollCompensationUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollCompensation.updateMany({
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
  }): Promise<{ dbRecords: PayrollCompensationWithLineItemsType[]; totalRecords: number }> {
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
      pc.payrollCompensation.count({ where }),
      pc.payrollCompensation.findMany({
        where,
        include: lineItemsInclude,
        orderBy: { effectiveFrom: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async findActiveWithEmployeeInfo(params: {
    organizationId: number;
    page: number;
    limit: number;
    search?: string;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: PayrollCompensationWithEmployeeInfoType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const searchFilter: Prisma.PayrollCompensationWhereInput | undefined = params.search
      ? {
          OR: [
            { user: { firstname: { contains: params.search, mode: 'insensitive' } } },
            { user: { lastname: { contains: params.search, mode: 'insensitive' } } },
            { user: { email: { contains: params.search, mode: 'insensitive' } } },
            { user: { employees: { some: { employeeCode: { contains: params.search, mode: 'insensitive' }, organizationId: params.organizationId } } } },
          ],
        }
      : undefined;

    const where: Prisma.PayrollCompensationWhereInput = {
      isActive: true,
      organizationId: params.organizationId,
      ...searchFilter,
    };

    const [totalRecords, dbRecords] = await Promise.all([
      pc.payrollCompensation.count({ where }),
      pc.payrollCompensation.findMany({
        where,
        include: {
          ...lineItemsInclude,
          user: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
              employees: { where: { organizationId: params.organizationId }, select: { employeeCode: true }, take: 1 },
            },
          },
        },
        orderBy: { user: { firstname: 'asc' } },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

// Base table record types
type PayrollCompensationSelectTableRecordType = Prisma.PayrollCompensationGetPayload<{}>;
type PayrollCompensationInsertTableRecordType = Prisma.PayrollCompensationCreateInput;
type PayrollCompensationUpdateTableRecordType = Prisma.PayrollCompensationUpdateInput;

// Return types extending Prisma types
export type PayrollCompensationWithLineItemsType = PayrollCompensationSelectTableRecordType & {
  payrollCompensationLineItems: PayrollCompensationLineItem[];
};

export type PayrollCompensationWithEmployeeInfoType = PayrollCompensationWithLineItemsType & {
  user: { firstname: string; lastname: string; email: string; employees: Array<{ employeeCode: string }> };
};
