import { Injectable } from '@nestjs/common';
import type { LeaveConfig, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class LeaveConfigDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getLatest(params?: { tx?: Prisma.TransactionClient }): Promise<LeaveConfig | null> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.leaveConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }
}
