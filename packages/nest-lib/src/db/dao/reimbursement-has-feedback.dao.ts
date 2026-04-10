import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class ReimbursementHasFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: {
    data: { reimbursementId: number; createdById: number; message: string };
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.reimbursementHasFeedback.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('ReimbursementHasFeedback not created');
    }
    return dbRec.id;
  }

  public async update(params: {
    id: number;
    data: ReimbursementHasFeedbackUpdateTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.reimbursementHasFeedback.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.reimbursementHasFeedback.findUnique({ where: { id: params.id } });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Feedback not found');
    }
    await pc.reimbursementHasFeedback.delete({ where: { id: params.id } });
  }

  public async getByIdOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<ReimbursementHasFeedbackSelectTableRecordType> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.reimbursementHasFeedback.findUnique({ where: { id: params.id } });
    if (!result) {
      throw new DbRecordNotFoundError('Feedback not found');
    }
    return result;
  }
}

// Type definitions
type ReimbursementHasFeedbackSelectTableRecordType = Prisma.ReimbursementHasFeedbackGetPayload<{}>;
type ReimbursementHasFeedbackUpdateTableRecordType = Prisma.ReimbursementHasFeedbackUpdateInput;
