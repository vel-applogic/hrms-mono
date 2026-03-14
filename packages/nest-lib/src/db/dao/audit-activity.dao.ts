import { Injectable } from '@nestjs/common';
import { AuditActivityStatusDbEnum, AuditEventGroupDbEnum, AuditEventTypeDbEnum, Prisma } from '@repo/db';
import { AuditActivityByRelatedEntityRequestType, AuditActivityFilterRequestType } from '@repo/dto';
import { DbOperationError } from '@repo/shared';

import { BaseDao, OrderByParam } from './_base.dao.js';
import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class AuditActivityDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async logAudit(params: {
    eventGroup: AuditEventGroupDbEnum;
    eventType: AuditEventTypeDbEnum;
    status: AuditActivityStatusDbEnum;
    actorId?: number;
    description?: string;
    data?: Prisma.InputJsonValue;
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.auditActivity.create({
      data: {
        eventGroup: params.eventGroup,
        eventType: params.eventType,
        status: params.status,
        actorId: params.actorId,
        description: params.description,
        data: params.data || undefined,
      },
    });
    if (!created?.id) {
      throw new DbOperationError('AuditChange record not created');
    }
    return created.id;
  }

  public async search(params: { filterDto: AuditActivityFilterRequestType; orderBy?: OrderByParam; tx?: Prisma.TransactionClient }): Promise<{
    dbRecords: AuditActivityWithActorType[];
    totalRecords: number;
  }> {
    const pc = this.getPrismaClient(params.tx);

    const where: Prisma.AuditActivityWhereInput = {};

    // Handle search text - search in description
    if (params.filterDto.search) {
      where.description = {
        contains: params.filterDto.search,
        mode: 'insensitive',
      };
    }

    // Handle array filters
    if (params.filterDto.eventGroups && params.filterDto.eventGroups.length > 0) {
      where.eventGroup = {
        in: params.filterDto.eventGroups,
      };
    }

    if (params.filterDto.eventTypes && params.filterDto.eventTypes.length > 0) {
      where.eventType = {
        in: params.filterDto.eventTypes,
      };
    }

    if (params.filterDto.userIds && params.filterDto.userIds.length > 0) {
      where.actorId = {
        in: params.filterDto.userIds,
      };
    }

    // Add date range filter for createdAt
    if (params.filterDto.startDate || params.filterDto.endDate) {
      where.createdAt = {};
      if (params.filterDto.startDate) {
        where.createdAt.gte = new Date(params.filterDto.startDate);
      }
      if (params.filterDto.endDate) {
        const endDate = new Date(params.filterDto.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [dbRecords, totalRecords] = await Promise.all([
      pc.auditActivity.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: params.orderBy,
        skip: (params.filterDto.pagination.page - 1) * params.filterDto.pagination.limit,
        take: params.filterDto.pagination.limit,
      }),
      pc.auditActivity.count({ where }),
    ]);

    return {
      dbRecords,
      totalRecords,
    };
  }

  public async getByIdWithRelations(params: { id: number; tx?: Prisma.TransactionClient }): Promise<AuditActivityWithRelationsType | null> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.auditActivity.findFirst({
      where: { id: params.id },
      include: {
        actor: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
        entities: true,
      },
    });

    if (!dbRec) {
      return null;
    }

    return {
      ...dbRec,
      entities: dbRec.entities,
    };
  }

  public async getDistinctEventGroups(): Promise<AuditEventGroupDbEnum[]> {
    const pc = this.getPrismaClient();
    const results = await pc.auditActivity.findMany({
      select: {
        eventGroup: true,
      },
      distinct: ['eventGroup'],
      orderBy: {
        eventGroup: 'asc',
      },
    });
    return results.map((r) => r.eventGroup);
  }

  public async getDistinctEventTypes(): Promise<AuditEventTypeDbEnum[]> {
    const pc = this.getPrismaClient();
    const results = await pc.auditActivity.findMany({
      select: {
        eventType: true,
      },
      distinct: ['eventType'],
      orderBy: {
        eventType: 'asc',
      },
    });
    return results.map((r) => r.eventType);
  }

  public async searchByRelatedEntity(params: { filterDto: AuditActivityByRelatedEntityRequestType; tx?: Prisma.TransactionClient }): Promise<{
    dbRecords: AuditActivityWithActorType[];
    totalRecords: number;
  }> {
    const pc = this.getPrismaClient(params.tx);

    const where: Prisma.AuditActivityWhereInput = {
      entities: {
        some: {
          OR: params.filterDto.id.map((item) => ({
            entityType: item.entityType,
            entityId: item.entityId,
          })),
        },
      },
    };

    // Handle search text - search in description
    if (params.filterDto.search) {
      where.description = {
        contains: params.filterDto.search,
        mode: 'insensitive',
      };
    }

    // Handle array filters
    if (params.filterDto.eventGroups && params.filterDto.eventGroups.length > 0) {
      where.eventGroup = {
        in: params.filterDto.eventGroups,
      };
    }

    if (params.filterDto.eventTypes && params.filterDto.eventTypes.length > 0) {
      where.eventType = {
        in: params.filterDto.eventTypes,
      };
    }

    const [dbRecords, totalRecords] = await Promise.all([
      pc.auditActivity.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (params.filterDto.pagination.page - 1) * params.filterDto.pagination.limit,
        take: params.filterDto.pagination.limit,
      }),
      pc.auditActivity.count({ where }),
    ]);

    return {
      dbRecords,
      totalRecords,
    };
  }
}

export type AuditActivityWithActorType = Prisma.AuditActivityGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        firstname: true;
        lastname: true;
        email: true;
        role: true;
      };
    };
  };
}>;

export type AuditActivityWithRelationsType = Prisma.AuditActivityGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        firstname: true;
        lastname: true;
        email: true;
        role: true;
      };
    };
    entities: true;
  };
}>;

export type AuditActivitySelectTableRecordType = Prisma.AuditActivityGetPayload<{}>;
type AuditActivityInsertTableRecordType = Prisma.AuditActivityCreateInput;
type AuditActivityUpdateTableRecordType = Prisma.AuditActivityUpdateInput;
