import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class DevicePossessionHistoryDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: DevicePossessionHistoryInsertType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.devicePossessionHistory.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('DevicePossessionHistory not created');
    }
    return dbRec.id;
  }

  public async closeOpenRecord(params: { deviceId: number; toDate: Date; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.devicePossessionHistory.updateMany({
      where: { deviceId: params.deviceId, toDate: null },
      data: { toDate: params.toDate },
    });
  }
}

type DevicePossessionHistoryInsertType = Prisma.DevicePossessionHistoryCreateInput;
