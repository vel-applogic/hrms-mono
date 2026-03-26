import { Injectable } from '@nestjs/common';
import type { Prisma, Policy } from '@repo/db';

import { PolicyFilterRequestType } from '@repo/dto';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class PolicyDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.PolicyCreateInput; tx?: Prisma.TransactionClient }): Promise<Policy> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policy.create({ data: params.data });
  }

  async update(params: { id: number; organizationId: number; data: Prisma.PolicyUpdateInput; tx?: Prisma.TransactionClient }): Promise<Policy> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policy.update({
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

  async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PolicyDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policy.findFirst({
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
  }

  async delete(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<Policy> {
    const pc = this.getPrismaClient(params.tx);
    return pc.policy.delete({
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
