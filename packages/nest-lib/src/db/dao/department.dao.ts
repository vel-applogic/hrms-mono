import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { DepartmentFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class DepartmentDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<DepartmentSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.department.findUnique({ where: { id: params.id } });
    return dbRec ?? undefined;
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<DepartmentSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.department.findMany({ where: { organizationId: params.organizationId }, orderBy: { name: 'asc' } });
  }

  public async findByNameAndOrganization(params: { name: string; organizationId: number; excludeId?: number; tx?: Prisma.TransactionClient }): Promise<DepartmentSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.department.findFirst({
      where: {
        name: { equals: params.name, mode: 'insensitive' },
        organizationId: params.organizationId,
        ...(params.excludeId !== undefined ? { id: { not: params.excludeId } } : {}),
      },
    });
    return dbRec ?? undefined;
  }

  public async create(params: { data: DepartmentInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.department.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Department not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: DepartmentUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.department.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.department.findUnique({ where: { id: params.id } });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid department id');
    }
    await pc.department.delete({ where: { id: params.id } });
  }

  public async search(params: {
    filterDto: DepartmentFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: DepartmentSelectTableRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    });

    const where: Prisma.DepartmentWhereInput = { organizationId: params.organizationId };

    if (params.filterDto.search) {
      where.name = { contains: params.filterDto.search, mode: 'insensitive' };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.department.count({ where }),
      pc.department.findMany({
        where,
        take,
        skip,
        orderBy: params.orderBy ?? { createdAt: 'desc' },
      }),
    ]);

    return { dbRecords, totalRecords };
  }
}

// Type definitions
type DepartmentSelectTableRecordType = Prisma.DepartmentGetPayload<{}>;
type DepartmentInsertTableRecordType = Prisma.DepartmentCreateInput;
type DepartmentUpdateTableRecordType = Prisma.DepartmentUpdateInput;

export type { DepartmentSelectTableRecordType };
