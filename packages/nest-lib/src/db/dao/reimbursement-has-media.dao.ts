import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class ReimbursementHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: {
    data: { reimbursementId: number; mediaId: number };
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.reimbursementHasMedia.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('ReimbursementHasMedia not created');
    }
    return dbRec.id;
  }

  public async deleteManyByReimbursementId(params: { reimbursementId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.reimbursementHasMedia.deleteMany({ where: { reimbursementId: params.reimbursementId } });
  }
}
