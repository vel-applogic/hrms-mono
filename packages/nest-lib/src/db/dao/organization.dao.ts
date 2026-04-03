import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OrganizationFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import type { OrderByParam } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class OrganizationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organization.findUnique({ where: { id: params.id } });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType> {
    const dbRec = await this.findById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Organization not found');
    }
    return dbRec;
  }

  public async getByIdWithLogoOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganizationWithLogoType> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organization.findUnique({
      where: { id: params.id },
      include: { logo: true },
    });
    if (!dbRec) {
      throw new DbRecordNotFoundError('Organization not found');
    }
    return dbRec;
  }

  public async findAll(params?: { tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.organization.findMany({ orderBy: { name: 'asc' } });
  }

  public async findByName(params: { name: string; tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organization.findFirst({ where: { name: { equals: params.name, mode: 'insensitive' } } });
    return dbRec ?? undefined;
  }

  public async search(params: {
    filterDto: OrganizationFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: OrganizationSelectTableRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({ pageNo: params.filterDto.pagination.page, pageSize: params.filterDto.pagination.limit });

    const where: Prisma.OrganizationWhereInput = {};
    if (params.filterDto.search) {
      where.name = { contains: params.filterDto.search, mode: 'insensitive' };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.organization.count({ where }),
      pc.organization.findMany({ where, orderBy: params.orderBy ?? { createdAt: 'desc' }, take, skip }),
    ]);

    return { totalRecords, dbRecords };
  }

  public async create(params: { data: OrganizationInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organization.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Organization not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: OrganizationUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organization.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organization.findUnique({ where: { id: params.id } });
    if (!dbRec) {
      throw new DbRecordNotFoundError('Invalid organization id');
    }
    await pc.organization.delete({ where: { id: params.id } });
  }
}

// Type definitions
type OrganizationSelectTableRecordType = Prisma.OrganizationGetPayload<{}>;
type OrganizationInsertTableRecordType = Prisma.OrganizationCreateInput;
type OrganizationUpdateTableRecordType = Prisma.OrganizationUpdateInput;

export type { OrganizationSelectTableRecordType };

export type OrganizationWithLogoType = Prisma.OrganizationGetPayload<{
  include: { logo: true };
}>;
