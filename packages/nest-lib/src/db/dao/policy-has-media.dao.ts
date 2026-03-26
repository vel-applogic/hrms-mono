import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class PolicyHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: PolicyHasMediaInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.policyHasMedia.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('PolicyHasMedia not created');
    }
    return dbRec.id;
  }

  public async deleteManyByPolicyId(params: { policyId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.policyHasMedia.deleteMany({ where: { policyId: params.policyId } });
  }
}

// Type definitions
type PolicyHasMediaSelectTableRecordType = Prisma.PolicyHasMediaGetPayload<{}>;
type PolicyHasMediaInsertTableRecordType = Prisma.PolicyHasMediaCreateInput;
type PolicyHasMediaUpdateTableRecordType = Prisma.PolicyHasMediaUpdateInput;
