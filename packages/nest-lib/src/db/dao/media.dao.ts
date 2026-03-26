import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { BaseDao } from './_base.dao.js';
import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class MediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: MediaInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.media.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Media not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: MediaUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.media.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<MediaSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.media.findFirst({
      where: { id: params.id },
    });

    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<MediaSelectTableRecordType> {
    const dbRec = await this.getById(params);

    if (!dbRec) {
      throw new DbRecordNotFoundError('No record found');
    }

    return dbRec;
  }

  public async deleteByIdOrThrow(params: { mediaId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.media.findUnique({
      where: { id: params.mediaId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid media id');
    }
    await pc.media.delete({
      where: { id: params.mediaId },
    });
  }

  public async deleteManyByIds(params: { ids: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.media.deleteMany({
      where: { id: { in: params.ids } },
    });
  }
}

// Type definitions
type MediaSelectTableRecordType = Prisma.MediaGetPayload<{}>;
type MediaInsertTableRecordType = Prisma.MediaCreateInput;
type MediaUpdateTableRecordType = Prisma.MediaUpdateInput;
