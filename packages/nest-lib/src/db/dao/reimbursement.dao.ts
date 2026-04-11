import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ReimbursementFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class ReimbursementDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: ReimbursementInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.reimbursement.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Reimbursement not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: ReimbursementUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.reimbursement.update({ where: { id: params.id }, data: params.data });
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<ReimbursementWithRelationsType> {
    const pc = this.getPrismaClient(params.tx);
    const result = await pc.reimbursement.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
        reimbursementHasMedias: {
          include: { media: true },
        },
        reimbursementHasFeedbacks: {
          include: { createdBy: { select: { id: true, firstname: true, lastname: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!result) {
      throw new DbRecordNotFoundError('Reimbursement not found');
    }
    return result;
  }

  public async search(params: {
    organizationId: number;
    userId?: number;
    page: number;
    limit: number;
    search?: string;
    filterDto: ReimbursementFilterRequestType;
    tx?: Prisma.TransactionClient;
  }): Promise<{ dbRecords: ReimbursementListRecordType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.page,
      pageSize: params.limit,
    });

    const where: Prisma.ReimbursementWhereInput = {
      organizationId: params.organizationId,
    };

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.search?.trim()) {
      where.title = { contains: params.search.trim(), mode: 'insensitive' };
    }

    if (params.filterDto.statuses && params.filterDto.statuses.length > 0) {
      where.status = { in: params.filterDto.statuses };
    }

    if (params.filterDto.userIds && params.filterDto.userIds.length > 0) {
      where.userId = { in: params.filterDto.userIds };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.reimbursement.count({ where }),
      pc.reimbursement.findMany({
        where,
        include: {
          user: { select: { id: true, firstname: true, lastname: true, email: true } },
          reimbursementHasFeedbacks: {
            include: { createdBy: { select: { id: true, firstname: true, lastname: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async count(params: {
    organizationId: number;
    userId?: number;
    where?: Prisma.ReimbursementWhereInput;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const where: Prisma.ReimbursementWhereInput = {
      organizationId: params.organizationId,
      ...params.where,
    };
    if (params.userId) {
      where.userId = params.userId;
    }
    return pc.reimbursement.count({ where });
  }
}

// Base table record types
type ReimbursementSelectTableRecordType = Prisma.ReimbursementGetPayload<{}>;
type ReimbursementInsertTableRecordType = Prisma.ReimbursementCreateInput;
type ReimbursementUpdateTableRecordType = Prisma.ReimbursementUpdateInput;

export type ReimbursementWithRelationsType = Prisma.ReimbursementGetPayload<{
  include: {
    user: { select: { id: true; firstname: true; lastname: true; email: true } };
    reimbursementHasMedias: { include: { media: true } };
    reimbursementHasFeedbacks: {
      include: { createdBy: { select: { id: true; firstname: true; lastname: true } } };
    };
  };
}>;

export type ReimbursementListRecordType = Prisma.ReimbursementGetPayload<{
  include: {
    user: { select: { id: true; firstname: true; lastname: true; email: true } };
    reimbursementHasFeedbacks: {
      include: { createdBy: { select: { id: true; firstname: true; lastname: true } } };
    };
  };
}>;

export type { ReimbursementSelectTableRecordType };
