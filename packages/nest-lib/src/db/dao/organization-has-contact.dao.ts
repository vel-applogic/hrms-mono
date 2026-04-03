import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganizationHasContactDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganizationHasContactInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organizationHasContact.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organization contact link not created');
    }
    return created.id;
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasContactWithContactType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasContact.findMany({
      where: { organizationId: params.organizationId },
      include: { contact: true },
    });
  }

  public async deleteByOrganizationId(params: { organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasContact.deleteMany({
      where: { organizationId: params.organizationId },
    });
  }

  public async deleteManyByContactIds(params: { contactIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasContact.deleteMany({
      where: { contactId: { in: params.contactIds } },
    });
  }
}

// Type definitions
type OrganizationHasContactInsertTableRecordType = Prisma.OrganizationHasContactCreateInput;

export type OrganizationHasContactWithContactType = Prisma.OrganizationHasContactGetPayload<{
  include: { contact: true };
}>;
