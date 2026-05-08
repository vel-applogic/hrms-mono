import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganisationHasAddressDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganisationHasAddressInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisationHasAddress.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organisation address link not created');
    }
    return created.id;
  }

  public async findByOrganisationId(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<OrganisationHasAddressWithAddressType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasAddress.findMany({
      where: { organisationId: params.organisationId },
      include: { address: { include: { country: true } } },
    });
  }

  public async deleteByOrganisationId(params: { organisationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasAddress.deleteMany({
      where: { organisationId: params.organisationId },
    });
  }
}

// Type definitions
type OrganisationHasAddressInsertTableRecordType = Prisma.OrganisationHasAddressCreateInput;

export type OrganisationHasAddressWithAddressType = Prisma.OrganisationHasAddressGetPayload<{
  include: { address: { include: { country: true } } };
}>;
