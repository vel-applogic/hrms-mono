import { Injectable } from '@nestjs/common';
import type { Candidate, CandidateHasMedia, Media, Prisma } from '@repo/db';
import { CandidateProgress, CandidateSource, CandidateStatus } from '@repo/db';
import type { CandidateFilterRequestType } from '@repo/dto';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class CandidateDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.CandidateCreateInput; tx?: Prisma.TransactionClient }): Promise<Candidate> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidate.create({ data: params.data });
  }

  async update(params: { id: number; organizationId: number; data: Prisma.CandidateUpdateInput; tx?: Prisma.TransactionClient }): Promise<Candidate> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidate.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<CandidateDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidate.findFirst({
      where: {
        id: params.id,
        isDeleted: false,
        organizationId: params.organizationId,
      },
      include: {
        candidateHasMedias: {
          include: { media: true },
        },
      },
    });
  }

  async delete(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<Candidate> {
    const pc = this.getPrismaClient(params.tx);
    return pc.candidate.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: { isDeleted: true },
    });
  }

  async search(params: {
    filterDto: CandidateFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: CandidateListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    });

    const where: Prisma.CandidateWhereInput = {
      isDeleted: false,
      organizationId: params.organizationId,
    };

    if (params.filterDto.search) {
      where.OR = [
        { firstname: { contains: params.filterDto.search, mode: 'insensitive' } },
        { lastname: { contains: params.filterDto.search, mode: 'insensitive' } },
        { email: { contains: params.filterDto.search, mode: 'insensitive' } },
        { skills: { has: params.filterDto.search } },
      ];
    }

    if (params.filterDto.status?.length) {
      where.status = { in: params.filterDto.status as unknown as CandidateStatus[] };
    }

    if (params.filterDto.progress?.length) {
      where.progress = { in: params.filterDto.progress as unknown as CandidateProgress[] };
    }

    if (params.filterDto.source?.length) {
      where.source = { in: params.filterDto.source as unknown as CandidateSource[] };
    }

    const [totalRecords, dbRecords] = await Promise.all([pc.candidate.count({ where }), pc.candidate.findMany({ where, take, skip, orderBy: params.orderBy })]);

    return { dbRecords, totalRecords };
  }
}

export type CandidateListRecordType = Prisma.CandidateGetPayload<{}>;
export type CandidateDetailRecordType = Prisma.CandidateGetPayload<{
  include: {
    candidateHasMedias: {
      include: { media: true };
    };
  };
}>;
export type CandidateHasMediaWithMedia = CandidateHasMedia & { media: Media };
