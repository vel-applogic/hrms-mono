import { Injectable } from '@nestjs/common';
import type { Prisma, User, Employee } from '@repo/db';
import { EmployeeStatusEnum } from '@repo/db';
import type { EmployeeFilterRequestType } from '@repo/dto';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class EmployeeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAllWithUser(params?: { organizationId?: number; tx?: Prisma.TransactionClient }): Promise<EmployeeListRecordType[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.employee.findMany({
      where: params?.organizationId ? { organizationId: params.organizationId } : undefined,
      include: { user: true },
      orderBy: { user: { firstname: 'asc' } },
    });
  }

  async getByUserId(params: { userId: number; organizationId?: number; tx?: Prisma.TransactionClient }): Promise<EmployeeDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.findFirst({
      where: {
        userId: params.userId,
        ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      },
      include: {
        user: true,
        reportTo: { select: { id: true, firstname: true, lastname: true, email: true } },
      },
    });
  }

  async findByEmployeeCode(params: {
    employeeCode: string;
    organizationId: number;
    excludeUserId?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<Employee | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.findFirst({
      where: {
        employeeCode: params.employeeCode,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
  }

  async findByPan(params: {
    pan: string;
    organizationId: number;
    excludeUserId?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<Employee | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.findFirst({
      where: {
        pan: params.pan,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
  }

  async findByAadhaar(params: {
    aadhaar: string;
    organizationId: number;
    excludeUserId?: number;
    tx?: Prisma.TransactionClient;
  }): Promise<Employee | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.findFirst({
      where: {
        aadhaar: params.aadhaar,
        organizationId: params.organizationId,
        ...(params.excludeUserId !== undefined ? { userId: { not: params.excludeUserId } } : {}),
      },
    });
  }

  async create(params: { data: Prisma.EmployeeCreateInput; tx?: Prisma.TransactionClient }): Promise<Employee> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employee.create({ data: params.data });
  }

  async update(params: {
    userId: number;
    organizationId?: number;
    data: Prisma.EmployeeUpdateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<Employee> {
    const pc = this.getPrismaClient(params.tx);
    const existing = await pc.employee.findFirst({
      where: {
        userId: params.userId,
        ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      },
    });
    if (!existing) throw new Error(`Employee with userId ${params.userId} not found`);
    return pc.employee.update({ where: { id: existing.id }, data: params.data });
  }

  async search(params: {
    filterDto: EmployeeFilterRequestType;
    organizationId?: number;
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
      where.status = { in: params.filterDto.status as unknown as EmployeeStatusEnum[] };
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
}

export type EmployeeListRecordType = Prisma.EmployeeGetPayload<{
  include: { user: true };
}>;
export type EmployeeDetailRecordType = Prisma.EmployeeGetPayload<{
  include: {
    user: true;
    reportTo: { select: { id: true; firstname: true; lastname: true; email: true } };
  };
}>;
