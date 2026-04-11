import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { EmployeeStatusEnum } from '@repo/db';
import type { EmployeeFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class EmployeeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findAllWithUser(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeListRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.findMany({
      where: { organizationId: params.organizationId },
      include: { user: true },
      orderBy: { user: { firstname: 'asc' } },
    });
  }

  public async getByUserId(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeDetailRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employee.findFirst({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
      include: {
        user: true,
        reportTo: { select: { id: true, firstname: true, lastname: true, email: true } },
      },
    });
    return dbRec ?? undefined;
  }

  public async findByEmployeeCode(params: { employeeCode: string; organizationId: number; excludeUserId?: number; tx?: Prisma.TransactionClient }): Promise<EmployeeSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employee.findFirst({
      where: {
        employeeCode: params.employeeCode,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
    return dbRec ?? undefined;
  }

  public async findByPan(params: { pan: string; organizationId: number; excludeUserId?: number; tx?: Prisma.TransactionClient }): Promise<EmployeeSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employee.findFirst({
      where: {
        pan: params.pan,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
    return dbRec ?? undefined;
  }

  public async findByAadhaar(params: { aadhaar: string; organizationId: number; excludeUserId?: number; tx?: Prisma.TransactionClient }): Promise<EmployeeSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employee.findFirst({
      where: {
        aadhaar: params.aadhaar,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
    return dbRec ?? undefined;
  }

  public async create(params: { data: EmployeeInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.employee.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Employee not created');
    }
    return created.id;
  }

  public async update(params: { userId: number; organizationId: number; data: EmployeeUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const existing = await pc.employee.findFirst({
      where: {
        userId: params.userId,
        organizationId: params.organizationId,
      },
    });
    if (!existing) {
      throw new DbRecordNotFoundError(`Employee with userId ${params.userId} not found`);
    }
    await pc.employee.update({ where: { id: existing.id }, data: params.data });
  }

  public async search(params: {
    filterDto: EmployeeFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: EmployeeListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    });

    const where: Prisma.EmployeeWhereInput = params.organizationId ? { organizationId: params.organizationId } : {};

    if (params.filterDto.search) {
      where.OR = [
        { employeeCode: { contains: params.filterDto.search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstname: { contains: params.filterDto.search, mode: 'insensitive' } },
              { lastname: { contains: params.filterDto.search, mode: 'insensitive' } },
              { email: { contains: params.filterDto.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (params.filterDto.status?.length) {
      where.status = { in: this.toEnumArray(params.filterDto.status, EmployeeStatusEnum) };
    }

    const [totalRecords, dbRecords] = await Promise.all([
      pc.employee.count({ where }),
      pc.employee.findMany({
        where,
        include: { user: true },
        take,
        skip,
        orderBy: params.orderBy ?? { createdAt: 'desc' },
      }),
    ]);

    return { dbRecords, totalRecords };
  }
  public async countByStatus(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<{ status: string; count: number }[]> {
    const pc = this.getPrismaClient(params.tx);
    const results = await pc.employee.groupBy({
      by: ['status'],
      where: { organizationId: params.organizationId },
      _count: true,
    });
    return results.map((r) => ({ status: r.status, count: r._count }));
  }

  public async countActiveWithoutReportTo(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.count({
      where: { organizationId: params.organizationId, status: 'active', reportToId: null },
    });
  }

  public async findActiveUserIds(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<number[]> {
    const pc = this.getPrismaClient(params.tx);
    const results = await pc.employee.findMany({
      where: { organizationId: params.organizationId, status: 'active' },
      select: { userId: true },
    });
    return results.map((r) => r.userId);
  }
}

// Type definitions
type EmployeeSelectTableRecordType = Prisma.EmployeeGetPayload<{}>;
type EmployeeInsertTableRecordType = Prisma.EmployeeCreateInput;
type EmployeeUpdateTableRecordType = Prisma.EmployeeUpdateInput;

export type EmployeeListRecordType = Prisma.EmployeeGetPayload<{
  include: { user: true };
}>;
export type EmployeeDetailRecordType = Prisma.EmployeeGetPayload<{
  include: {
    user: true;
    reportTo: { select: { id: true; firstname: true; lastname: true; email: true } };
  };
}>;
