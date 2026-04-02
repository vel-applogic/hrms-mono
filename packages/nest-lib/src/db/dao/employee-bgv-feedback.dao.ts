import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class EmployeeBgvFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: EmployeeBgvFeedbackInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.employeeBgvFeedback.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Employee BGV feedback not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: EmployeeBgvFeedbackUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.employeeBgvFeedback.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.employeeBgvFeedback.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid employee BGV feedback id');
    }
    // Delete related media first
    await pc.employyBgvFeedbackHasMedia.deleteMany({
      where: { employeeBgvFeedbackId: params.id },
    });
    await pc.employeeBgvFeedback.delete({
      where: { id: params.id },
    });
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeBgvFeedbackWithMediaType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employeeBgvFeedback.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: {
        employyBgvFeedbackHasMedias: {
          include: { media: true },
        },
      },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeBgvFeedbackWithMediaType> {
    const dbRec = await this.getById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Employee BGV feedback not found');
    }
    return dbRec;
  }

  public async findByUserIdWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: EmployeeBgvFeedbackWithMediaType[]; totalRecords: number }> {
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
      pc.employeeBgvFeedback.count({ where }),
      pc.employeeBgvFeedback.findMany({
        where,
        include: {
          employyBgvFeedbackHasMedias: {
            include: { media: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

export type EmployeeBgvFeedbackWithMediaType = Prisma.employeeBgvFeedbackGetPayload<{
  include: {
    employyBgvFeedbackHasMedias: {
      include: { media: true };
    };
  };
}>;

type EmployeeBgvFeedbackInsertTableRecordType = Prisma.employeeBgvFeedbackCreateInput;
type EmployeeBgvFeedbackUpdateTableRecordType = Prisma.employeeBgvFeedbackUpdateInput;
