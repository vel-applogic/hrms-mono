import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class CandidateHasFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: {
    data: CandidateHasFeedbackInsertTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.candidateHasFeedback.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('CandidateHasFeedback not created');
    }
    return dbRec.id;
  }

  public async update(params: {
    id: number;
    data: CandidateHasFeedbackUpdateTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasFeedback.update({ where: { id: params.id }, data: params.data });
  }

  public async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasFeedback.delete({ where: { id: params.id } });
  }

  public async getById(params: {
    id: number;
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasFeedbackWithUserType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return await pc.candidateHasFeedback.findUnique({
      where: { id: params.id },
      include: { createdBy: true },
    }) ?? undefined;
  }

  public async findByCandidateId(params: {
    candidateId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasFeedbackWithUserType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasFeedback.findMany({
      where: { candidateId: params.candidateId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findByCandidateIdWithPagination(params: {
    candidateId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: CandidateHasFeedbackWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, dbRecords] = await Promise.all([
      pc.candidateHasFeedback.count({ where: { candidateId: params.candidateId } }),
      pc.candidateHasFeedback.findMany({
        where: { candidateId: params.candidateId },
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

// Type definitions
type CandidateHasFeedbackSelectTableRecordType = Prisma.CandidateHasFeedbackGetPayload<{}>;
type CandidateHasFeedbackInsertTableRecordType = Prisma.CandidateHasFeedbackCreateInput;
type CandidateHasFeedbackUpdateTableRecordType = Prisma.CandidateHasFeedbackUpdateInput;

export type CandidateHasFeedbackWithUserType = Prisma.CandidateHasFeedbackGetPayload<{
  include: { createdBy: true };
}>;
