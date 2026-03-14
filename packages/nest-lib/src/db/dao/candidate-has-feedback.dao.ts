import { Injectable } from '@nestjs/common';
import type { CandidateHasFeedback, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class CandidateHasFeedbackDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.CandidateHasFeedbackCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasFeedback.create({ data: params.data });
  }

  async update(params: {
    id: number;
    data: Prisma.CandidateHasFeedbackUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasFeedback.update({ where: { id: params.id }, data: params.data });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<CandidateHasFeedback> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasFeedback.delete({ where: { id: params.id } });
  }

  async getById(params: {
    id: number;
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasFeedbackWithUserType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasFeedback.findUnique({
      where: { id: params.id },
      include: { createdBy: true },
    });
  }

  async findByCandidateId(params: {
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

  async findByCandidateIdWithPagination(params: {
    candidateId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ feedbacks: CandidateHasFeedbackWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const [totalRecords, feedbacks] = await Promise.all([
      pc.candidateHasFeedback.count({ where: { candidateId: params.candidateId } }),
      pc.candidateHasFeedback.findMany({
        where: { candidateId: params.candidateId },
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { feedbacks, totalRecords };
  }
}

export type CandidateHasFeedbackWithUserType = Prisma.CandidateHasFeedbackGetPayload<{
  include: { createdBy: true };
}>;
