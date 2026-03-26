import { Injectable } from '@nestjs/common';
import type { Prisma, PayrollCompensation } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

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

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensationSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.payrollCompensation.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
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
    await pc.payrollCompensation.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async findByUserIdOrderedByEffectiveFromDesc(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollCompensation[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollCompensation.findMany({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
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
  }): Promise<{ dbRecords: PayrollCompensation[]; totalRecords: number }> {
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
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: PayrollCompensationWithEmployeeInfoType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where = {
      isActive: true,
      organizationId: params.organizationId,
    };

    const [totalRecords, dbRecords] = await Promise.all([
      pc.payrollCompensation.count({ where }),
      pc.payrollCompensation.findMany({
        where,
        include: { user: { select: { firstname: true, lastname: true, email: true } } },
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
export type PayrollCompensationWithEmployeeInfoType = PayrollCompensationSelectTableRecordType & {
  user: { firstname: string; lastname: string; email: string };
};
