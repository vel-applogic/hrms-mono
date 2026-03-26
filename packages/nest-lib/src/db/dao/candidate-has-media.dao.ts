import { Injectable } from '@nestjs/common';
import { CandidateMediaType, Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class CandidateHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: {
    data: { candidateId: number; mediaId: number; type: CandidateMediaType };
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.candidateHasMedia.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('CandidateHasMedia not created');
    }
    return dbRec.id;
  }

  public async deleteManyByCandidateIdAndType(params: {
    candidateId: number;
    type: CandidateMediaType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasMedia.deleteMany({
      where: { candidateId: params.candidateId, type: params.type },
    });
  }

  public async deleteManyByCandidateId(params: { candidateId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidateHasMedia.deleteMany({ where: { candidateId: params.candidateId } });
  }
}

// Type definitions
type CandidateHasMediaSelectTableRecordType = Prisma.CandidateHasMediaGetPayload<{}>;
type CandidateHasMediaInsertTableRecordType = Prisma.CandidateHasMediaCreateInput;
type CandidateHasMediaUpdateTableRecordType = Prisma.CandidateHasMediaUpdateInput;
