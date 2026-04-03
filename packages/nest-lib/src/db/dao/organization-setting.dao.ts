import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganizationSettingDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganizationSettingInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organizationSetting.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organization setting not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: OrganizationSettingUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationSetting.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationSettingSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organizationSetting.findFirst({
      where: { organizationId: params.organizationId },
    });
    return dbRec ?? undefined;
  }
}

// Type definitions
type OrganizationSettingInsertTableRecordType = Prisma.OrganizationSettingCreateInput;
type OrganizationSettingUpdateTableRecordType = Prisma.OrganizationSettingUpdateInput;
type OrganizationSettingSelectTableRecordType = Prisma.OrganizationSettingGetPayload<{}>;

export type { OrganizationSettingSelectTableRecordType };
