import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class NotificationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: NotificationInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.notification.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Notification not created');
    }
    return created.id;
  }

  public async createMany(params: { data: NotificationInsertTableRecordType[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.notification.createMany({ data: params.data });
  }

  public async markAsSeen(params: { id: number; userId: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.notification.updateMany({
      where: { id: params.id, userId: params.userId, organizationId: params.organizationId },
      data: { isSeen: true },
    });
  }

  public async markAllAsSeen(params: { userId: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.notification.updateMany({
      where: { userId: params.userId, organizationId: params.organizationId, isSeen: false },
      data: { isSeen: true },
    });
  }

  public async findManyWithPagination(params: {
    userId: number;
    organizationId: number;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: NotificationSelectTableRecordType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where: Prisma.NotificationWhereInput = {
      userId: params.userId,
      organizationId: params.organizationId,
    };

    const [totalRecords, dbRecords] = await Promise.all([
      pc.notification.count({ where }),
      pc.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async unseenCount(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    return pc.notification.count({
      where: { userId: params.userId, organizationId: params.organizationId, isSeen: false },
    });
  }
}

// Base table record types
type NotificationInsertTableRecordType = Prisma.NotificationCreateManyInput;
type NotificationSelectTableRecordType = Prisma.NotificationGetPayload<{}>;

export type { NotificationSelectTableRecordType };
