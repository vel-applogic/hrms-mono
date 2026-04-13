import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { AnnouncementFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class AnnouncementDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: AnnouncementInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.announcement.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Announcement not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: AnnouncementUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.announcement.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async search(params: {
    filterDto: AnnouncementFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: AnnouncementListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.AnnouncementWhereInput = { organizationId: params.organizationId };

    if (params.filterDto.search && params.filterDto.search.trim().length > 0) {
      where.title = { contains: params.filterDto.search, mode: 'insensitive' };
    }

    if (params.filterDto.branchIds?.length) {
      where.branchId = { in: params.filterDto.branchIds };
    }

    if (params.filterDto.departmentIds?.length) {
      where.departmentId = { in: params.filterDto.departmentIds };
    }

    if (params.filterDto.isPublished !== undefined) {
      where.isPublished = params.filterDto.isPublished;
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.announcement.count({ where }),
      pc.announcement.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          branch: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<AnnouncementDetailRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.announcement.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<AnnouncementDetailRecordType> {
    const dbRec = await this.getById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Announcement not found');
    }
    return dbRec;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.announcement.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid announcement id');
    }
    await pc.announcement.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async findPendingNotifications(params: { tx?: Prisma.TransactionClient }): Promise<AnnouncementDetailRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.announcement.findMany({
      where: {
        isPublished: true,
        isNotificationSent: false,
        scheduledAt: { lte: new Date() },
      },
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  public async markNotificationSent(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.announcement.update({
      where: { id: params.id },
      data: { isNotificationSent: true },
    });
  }
}

const announcementInclude = {
  branch: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
} as const;

export type AnnouncementListRecordType = Prisma.AnnouncementGetPayload<{
  include: typeof announcementInclude;
}>;
export type AnnouncementDetailRecordType = Prisma.AnnouncementGetPayload<{
  include: typeof announcementInclude;
}>;

type AnnouncementInsertTableRecordType = Prisma.AnnouncementCreateInput;
type AnnouncementUpdateTableRecordType = Prisma.AnnouncementUpdateInput;
