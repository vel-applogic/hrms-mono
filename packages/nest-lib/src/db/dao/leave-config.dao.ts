import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class LeaveConfigDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async getLatest(params?: { tx?: Prisma.TransactionClient }): Promise<LeaveConfigSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params?.tx);
    const result = await pc.leaveConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return result ?? undefined;
  }
}

// Base table record type
type LeaveConfigSelectTableRecordType = Prisma.LeaveConfigGetPayload<{}>;
