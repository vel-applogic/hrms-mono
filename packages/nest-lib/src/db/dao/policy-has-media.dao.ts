import { Injectable } from '@nestjs/common';
import type { PolicyHasMedia, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class PolicyHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.PolicyHasMediaCreateInput; tx?: Prisma.TransactionClient }): Promise<PolicyHasMedia> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policyHasMedia.create({ data: params.data });
  }

  async deleteManyByPolicyId(params: { policyId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policyHasMedia.deleteMany({ where: { policyId: params.policyId } });
  }
}
