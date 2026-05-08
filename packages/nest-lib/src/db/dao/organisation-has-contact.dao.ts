import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganisationHasContactDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganisationHasContactInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisationHasContact.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organisation contact link not created');
    }
    return created.id;
  }

  public async findByOrganisationId(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<OrganisationHasContactWithContactType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasContact.findMany({
      where: { organisationId: params.organisationId },
      include: { contact: true },
    });
  }

  public async deleteByOrganisationId(params: { organisationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasContact.deleteMany({
      where: { organisationId: params.organisationId },
    });
  }

  public async deleteManyByContactIds(params: { contactIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasContact.deleteMany({
      where: { contactId: { in: params.contactIds } },
    });
  }
}

// Type definitions
type OrganisationHasContactInsertTableRecordType = Prisma.OrganisationHasContactCreateInput;

export type OrganisationHasContactWithContactType = Prisma.OrganisationHasContactGetPayload<{
  include: { contact: true };
}>;
