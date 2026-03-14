import { Injectable } from '@nestjs/common';
import { CandidateHasMedia, CandidateMediaType, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class CandidateHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: { candidateId: number; mediaId: number; type: CandidateMediaType };
    tx?: Prisma.TransactionClient;
  }): Promise<CandidateHasMedia> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidateHasMedia.create({ data: params.data });
  }

  async deleteManyByCandidateIdAndType(params: {
    candidateId: number;
    type: CandidateMediaType;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasMedia.deleteMany({
      where: { candidateId: params.candidateId, type: params.type },
    });
  }

  async deleteManyByCandidateId(params: { candidateId: number; tx?: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasMedia.deleteMany({ where: { candidateId: params.candidateId } });
  }
}
