import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class OrganizationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.organization.findUnique({ where: { id: params.id } });
    return dbRec ?? undefined;
  }

  public async findAll(params?: { tx?: Prisma.TransactionClient }): Promise<OrganizationSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.organization.findMany({ orderBy: { name: 'asc' } });
  }

  public async create(params: { data: OrganizationInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organization.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Organization not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: OrganizationUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organization.update({ where: { id: params.id }, data: params.data });
  }
}

// Type definitions
type OrganizationSelectTableRecordType = Prisma.OrganizationGetPayload<{}>;
type OrganizationInsertTableRecordType = Prisma.OrganizationCreateInput;
type OrganizationUpdateTableRecordType = Prisma.OrganizationUpdateInput;

export type { OrganizationSelectTableRecordType };
