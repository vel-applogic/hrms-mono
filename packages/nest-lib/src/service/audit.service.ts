import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { AuditActivityDataType, AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';

import { CurrentUserType } from '../type/user.type.js';
import { auditActivityStatusDtoEnumToDbEnum, auditEntityTypeDtoEnumToDbEnum, auditEventGroupDtoEnumToDbEnum, auditEventTypeDtoEnumToDbEnum } from '../util/enum.util.js';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { AuditActivityDao } from '../db/dao/audit-activity.dao.js';
import { AuditActivityHasEntityDao } from '../db/dao/audit-activity-has-entity.dao.js';

export type AuditRelatedEntityType = { entityType: AuditEntityTypeDtoEnum; entityId: number; message?: string; isSourceEntity?: boolean };

@Injectable()
export class AuditService {
  constructor(
    private readonly auditActivityDao: AuditActivityDao,
    private readonly auditActivityHasEntityDao: AuditActivityHasEntityDao,
    private readonly prisma: PrismaService,
  ) {}

  public async recordActivity(params: {
    eventGroup: AuditEventGroupDtoEnum;
    eventType: AuditEventTypeDtoEnum;
    status: AuditActivityStatusDtoEnum;
    currentUser: CurrentUserType;
    description?: string;
    data?: AuditActivityDataType;
    relatedEntities?: AuditRelatedEntityType[];
  }): Promise<void> {
    await this.recordActivityInternal({
      eventGroup: params.eventGroup,
      eventType: params.eventType,
      status: params.status,
      actorId: params.currentUser.id,
      description: params.description,
      data: params.data,
      relatedEntities: params.relatedEntities,
    });
  }

  public async recordActivityAnonymous(params: {
    eventGroup: AuditEventGroupDtoEnum;
    eventType: AuditEventTypeDtoEnum;
    status: AuditActivityStatusDtoEnum;
    description?: string;
    data?: AuditActivityDataType;
    relatedEntities?: AuditRelatedEntityType[];
  }): Promise<void> {
    await this.recordActivityInternal({
      eventGroup: params.eventGroup,
      eventType: params.eventType,
      status: params.status,
      description: params.description,
      data: params.data,
      relatedEntities: params.relatedEntities,
    });
  }

  private async recordActivityInternal(params: {
    eventGroup: AuditEventGroupDtoEnum;
    eventType: AuditEventTypeDtoEnum;
    status: AuditActivityStatusDtoEnum;
    actorId?: number;
    description?: string;
    data?: AuditActivityDataType;
    relatedEntities?: AuditRelatedEntityType[];
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const auditId = await this.auditActivityDao.logAudit({
        eventGroup: auditEventGroupDtoEnumToDbEnum(params.eventGroup),
        eventType: auditEventTypeDtoEnumToDbEnum(params.eventType),
        status: auditActivityStatusDtoEnumToDbEnum(params.status),
        actorId: params.actorId,
        description: params.description,
        data: params.data as Prisma.InputJsonValue,
        tx: tx,
      });

      if (params.relatedEntities && params.relatedEntities.length > 0) {
        const entities = params.relatedEntities.map((entity) => ({
          entityType: auditEntityTypeDtoEnumToDbEnum(entity.entityType),
          entityId: entity.entityId,
          message: entity.message,
          isSourceEntity: entity.isSourceEntity,
        }));

        await this.auditActivityHasEntityDao.createBulk({
          auditId: auditId,
          entities: entities,
          tx: tx,
        });
      }
    });
  }
}
