import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DeviceFilterRequestType } from '@repo/dto';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class DeviceDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: DeviceInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.device.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Device not created');
    }
    return created.id;
  }

  public async update(params: { id: number; organizationId: number; data: DeviceUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.device.update({
      where: { id: params.id, organizationId: params.organizationId },
      data: params.data,
    });
  }

  public async search(params: {
    filterDto: DeviceFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: DeviceListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.DeviceWhereInput = { organizationId: params.organizationId };

    if (params.filterDto.search && params.filterDto.search.trim().length > 0) {
      const searchTerm = params.filterDto.search.trim();
      where.OR = [
        { brand: { contains: searchTerm, mode: 'insensitive' } },
        { model: { contains: searchTerm, mode: 'insensitive' } },
        { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (params.filterDto.statuses && params.filterDto.statuses.length > 0) {
      where.status = { in: params.filterDto.statuses };
    }

    if (params.filterDto.types && params.filterDto.types.length > 0) {
      where.type = { in: params.filterDto.types };
    }

    if (params.filterDto.assignedToIds && params.filterDto.assignedToIds.length > 0) {
      where.assignedToId = { in: params.filterDto.assignedToIds };
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.device.count({ where }),
      pc.device.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          assignedTo: { select: { id: true, firstname: true, lastname: true } },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  public async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<DeviceDetailRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.device.findFirst({
      where: {
        id: params.id,
        organizationId: params.organizationId,
      },
      include: {
        assignedTo: { select: { id: true, firstname: true, lastname: true } },
        deviceHasMedias: {
          include: {
            media: true,
          },
        },
        possessionHistories: {
          include: {
            user: { select: { id: true, firstname: true, lastname: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return dbRec ?? undefined;
  }

  public async getByIdOrThrow(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<DeviceDetailRecordType> {
    const dbRec = await this.getById(params);
    if (!dbRec) {
      throw new DbRecordNotFoundError('Device not found');
    }
    return dbRec;
  }

  public async deleteByIdOrThrow(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.device.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
    });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid device id');
    }
    await pc.device.delete({
      where: { id: params.id, organizationId: params.organizationId },
    });
  }

  public async getDevicesByUserId(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<DeviceListRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.device.findMany({
      where: {
        assignedToId: params.userId,
        organizationId: params.organizationId,
      },
      include: {
        assignedTo: { select: { id: true, firstname: true, lastname: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

const assignedToInclude = { select: { id: true, firstname: true, lastname: true } } as const;

export type DeviceListRecordType = Prisma.DeviceGetPayload<{
  include: { assignedTo: typeof assignedToInclude };
}>;
export type DeviceDetailRecordType = Prisma.DeviceGetPayload<{
  include: {
    assignedTo: typeof assignedToInclude;
    deviceHasMedias: { include: { media: true } };
    possessionHistories: { include: { user: typeof assignedToInclude } };
  };
}>;

type DeviceInsertTableRecordType = Prisma.DeviceCreateInput;
type DeviceUpdateTableRecordType = Prisma.DeviceUpdateInput;
