import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OrganisationFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import type { OrderByParam } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class OrganisationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganisationWithCurrencyType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisation.findUnique({
      where: { id: params.id },
      include: { currency: true },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganisationWithCurrencyType> {
    const dbRec = await this.findById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Organisation not found');
    }
    return dbRec;
  }

  public async getByIdWithLogoOrThrow(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganisationWithLogoType> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisation.findUnique({
      where: { id: params.id },
      include: { logo: true, currency: true },
    });
    if (!dbRec) {
      throw new DbRecordNotFoundError('Organisation not found');
    }
    return dbRec;
  }

  public async findAll(params?: { tx?: Prisma.TransactionClient }): Promise<OrganisationWithCurrencyType[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.organisation.findMany({ orderBy: { name: 'asc' }, include: { currency: true } });
  }

  public async findByName(params: { name: string; tx?: Prisma.TransactionClient }): Promise<OrganisationSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisation.findFirst({ where: { name: { equals: params.name, mode: 'insensitive' } } });
    return dbRec ?? undefined;
  }

  public async search(params: {
    filterDto: OrganisationFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: OrganisationWithCurrencyType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({ pageNo: params.filterDto.pagination.page, pageSize: params.filterDto.pagination.limit });

    const where: Prisma.OrganisationWhereInput = {};
    if (params.filterDto.search) {
      where.name = { contains: params.filterDto.search, mode: 'insensitive' };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.organisation.count({ where }),
      pc.organisation.findMany({ where, orderBy: params.orderBy ?? { createdAt: 'desc' }, take, skip, include: { currency: true } }),
    ]);

    return { totalRecords, dbRecords };
  }

  public async create(params: { data: OrganisationInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisation.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Organisation not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: OrganisationUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisation.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisation.findUnique({ where: { id: params.id } });
    if (!dbRec) {
      throw new DbRecordNotFoundError('Invalid organisation id');
    }
    await pc.organisation.delete({ where: { id: params.id } });
  }
}

// Type definitions
type OrganisationSelectTableRecordType = Prisma.OrganisationGetPayload<{}>;
type OrganisationInsertTableRecordType = Prisma.OrganisationCreateInput;
type OrganisationUpdateTableRecordType = Prisma.OrganisationUpdateInput;

export type { OrganisationSelectTableRecordType };

export type OrganisationWithCurrencyType = Prisma.OrganisationGetPayload<{
  include: { currency: true };
}>;

export type OrganisationWithLogoType = Prisma.OrganisationGetPayload<{
  include: { logo: true; currency: true };
}>;
