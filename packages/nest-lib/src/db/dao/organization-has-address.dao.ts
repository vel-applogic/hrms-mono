import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganizationHasAddressDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganizationHasAddressInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organizationHasAddress.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organization address link not created');
    }
    return created.id;
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasAddressWithAddressType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasAddress.findMany({
      where: { organizationId: params.organizationId },
      include: { address: { include: { country: true } } },
    });
  }

  public async deleteByOrganizationId(params: { organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasAddress.deleteMany({
      where: { organizationId: params.organizationId },
    });
  }
}

// Type definitions
type OrganizationHasAddressInsertTableRecordType = Prisma.OrganizationHasAddressCreateInput;

export type OrganizationHasAddressWithAddressType = Prisma.OrganizationHasAddressGetPayload<{
  include: { address: { include: { country: true } } };
}>;
