import { Injectable } from '@nestjs/common';
import type { CandidateHasMedia, Media, Prisma } from '@repo/db';
import { CandidateProgress, CandidateSource, CandidateStatus } from '@repo/db';
import type { CandidateFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class CandidateDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: CandidateInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.candidate.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Candidate not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: CandidateUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.candidate.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async getByEmail(params: { email: string; organizationId: number; tx?: Prisma.TransactionClient }): Promise<{ id: number } | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.candidate.findFirst({
      where: {
        email: params.email,
        organizationId: params.organizationId,
        isDeleted: false,
      },
      select: { id: true },
    });
    return dbRec ?? undefined;
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<CandidateDetailRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.candidate.findFirst({
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
    return dbRec ?? undefined;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.candidate.findFirst({
      where: { id: params.id, organizationId: params.organizationId, isDeleted: false },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid candidate id');
    }
    await pc.candidate.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: { isDeleted: true },
    });
  }

  public async search(params: {
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
      where.status = { in: this.toEnumArray(params.filterDto.status, CandidateStatus) };
    }

    if (params.filterDto.progress?.length) {
      where.progress = { in: this.toEnumArray(params.filterDto.progress, CandidateProgress) };
    }

    if (params.filterDto.source?.length) {
      where.source = { in: this.toEnumArray(params.filterDto.source, CandidateSource) };
    }

    const [totalRecords, dbRecords] = await Promise.all([pc.candidate.count({ where }), pc.candidate.findMany({ where, take, skip, orderBy: params.orderBy })]);

    return { dbRecords, totalRecords };
  }
}

// Type definitions
type CandidateSelectTableRecordType = Prisma.CandidateGetPayload<{}>;
type CandidateInsertTableRecordType = Prisma.CandidateCreateInput;
type CandidateUpdateTableRecordType = Prisma.CandidateUpdateInput;

export type CandidateListRecordType = Prisma.CandidateGetPayload<{}>;
export type CandidateDetailRecordType = Prisma.CandidateGetPayload<{
  include: {
    candidateHasMedias: {
      include: { media: true };
    };
  };
}>;
export type CandidateHasMediaWithMedia = CandidateHasMedia & { media: Media };
