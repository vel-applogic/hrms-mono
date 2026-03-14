import { Injectable } from '@nestjs/common';
import { AuditEntityTypeDbEnum, Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { BaseDao } from './_base.dao.js';
import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class AuditActivityHasEntityDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async createBulk(params: {
    auditId: number;
    entities: Array<{ entityType: AuditEntityTypeDbEnum; entityId: number; message?: string }>;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);

    const data = params.entities.map((entity) => ({
      auditId: params.auditId,
      entityType: entity.entityType,
      entityId: entity.entityId,
      message: entity.message,
    }));

    const created = await pc.auditActivityHasEntity.createMany({
      data,
    });

    if (!created) {
      throw new DbOperationError('AuditActivity entity relations not created');
    }
  }

  public async create(params: { auditId: number; entityType: AuditEntityTypeDbEnum; entityId: number; message?: string; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);

    const created = await pc.auditActivityHasEntity.create({
      data: {
        auditId: params.auditId,
        entityType: params.entityType,
        entityId: params.entityId,
        message: params.message,
      },
    });

    if (!created?.id) {
      throw new DbOperationError('AuditActivity entity relation not created');
    }

    return created.id;
  }
}

// Type definitions
type AuditActivityHasEntitySelectTableRecordType = Prisma.AuditActivityHasEntityGetPayload<{}>;
type AuditActivityHasEntityInsertTableRecordType = Prisma.AuditActivityHasEntityCreateInput;
type AuditActivityHasEntityUpdateTableRecordType = Prisma.AuditActivityHasEntityUpdateInput;
