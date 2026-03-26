import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class EmployeeFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: EmployeeFeedbackInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.employeeFeedback.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('EmployeeFeedback not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: EmployeeFeedbackUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.employeeFeedback.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.employeeFeedback.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid employee feedback id');
    }
    await pc.employeeFeedback.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedbackWithCreatedByType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employeeFeedback.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: { createdBy: true },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeFeedbackWithCreatedByType> {
    const dbRec = await this.getById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Employee feedback not found');
    }
    return dbRec;
  }

  public async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: EmployeeFeedbackWithCreatedByType[]; totalRecords: number }> {
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
      pc.employeeFeedback.count({ where }),
      pc.employeeFeedback.findMany({
        where,
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

export type EmployeeFeedbackWithCreatedByType = Prisma.EmployeeFeedbackGetPayload<{
  include: { createdBy: true };
}>;

type EmployeeFeedbackInsertTableRecordType = Prisma.EmployeeFeedbackCreateInput;
type EmployeeFeedbackUpdateTableRecordType = Prisma.EmployeeFeedbackUpdateInput;
