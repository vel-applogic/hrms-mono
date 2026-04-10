import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class DeviceHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: DeviceHasMediaInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.deviceHasMedia.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('DeviceHasMedia not created');
    }
    return dbRec.id;
  }

  public async deleteManyByDeviceId(params: { deviceId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.deviceHasMedia.deleteMany({ where: { deviceId: params.deviceId } });
  }
}

// Type definitions
type DeviceHasMediaInsertTableRecordType = Prisma.DeviceHasMediaCreateInput;
