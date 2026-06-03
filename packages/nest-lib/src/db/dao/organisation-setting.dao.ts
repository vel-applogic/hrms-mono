import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError, DEFAULT_FINANCIAL_YEAR_START_MONTH } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganisationSettingDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganisationSettingInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisationSetting.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organisation setting not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: OrganisationSettingUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationSetting.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async findByOrganisationId(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<OrganisationSettingSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisationSetting.findFirst({
      where: { organisationId: params.organisationId },
    });
    return dbRec ?? undefined;
  }

  public async getFinancialYearStartMonth(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organisationSetting.findFirst({
      where: { organisationId: params.organisationId },
      select: { financialYearStartsAt: true },
    });
    return dbRec?.financialYearStartsAt ?? DEFAULT_FINANCIAL_YEAR_START_MONTH;
  }
}

// Type definitions
type OrganisationSettingInsertTableRecordType = Prisma.OrganisationSettingCreateInput;
type OrganisationSettingUpdateTableRecordType = Prisma.OrganisationSettingUpdateInput;
type OrganisationSettingSelectTableRecordType = Prisma.OrganisationSettingGetPayload<{}>;

export type { OrganisationSettingSelectTableRecordType };
