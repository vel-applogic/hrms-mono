import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PolicyFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class PolicyDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: PolicyInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.policy.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Policy not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: PolicyUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.policy.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async search(params: {
    filterDto: PolicyFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: PolicyListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.PolicyWhereInput = { organizationId: params.organizationId };

    if (params.filterDto.search && params.filterDto.search.trim().length > 0) {
      where.title = { contains: params.filterDto.search, mode: 'insensitive' };
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.policy.count({ where }),
      pc.policy.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          policyHasMedias: {
            include: {
              media: true,
            },
          },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PolicyDetailRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.policy.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: {
        policyHasMedias: {
          include: {
            media: true,
          },
        },
      },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PolicyDetailRecordType> {
    const dbRec = await this.getById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Policy not found');
    }
    return dbRec;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.policy.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid policy id');
    }
    await pc.policy.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }
}

export type PolicyListRecordType = Prisma.PolicyGetPayload<{
  include: { policyHasMedias: { include: { media: true } } };
}>;
export type PolicyDetailRecordType = Prisma.PolicyGetPayload<{
  include: { policyHasMedias: { include: { media: true } } };
}>;

type PolicyInsertTableRecordType = Prisma.PolicyCreateInput;
type PolicyUpdateTableRecordType = Prisma.PolicyUpdateInput;
