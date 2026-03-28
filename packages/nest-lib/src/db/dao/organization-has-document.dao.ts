import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganizationHasDocumentDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganizationHasDocumentInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organizationHasDocument.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organization document not created');
    }
    return created.id;
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasDocumentWithMediaType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasDocument.findMany({
      where: { organizationId: params.organizationId },
      include: { document: true },
    });
  }

  public async deleteManyByOrganizationId(params: { organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasDocument.deleteMany({
      where: { organizationId: params.organizationId },
    });
  }

  public async deleteManyByIds(params: { ids: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasDocument.deleteMany({
      where: { id: { in: params.ids } },
    });
  }
}

// Type definitions
type OrganizationHasDocumentInsertTableRecordType = Prisma.OrganizationHasDocumentCreateInput;

export type OrganizationHasDocumentWithMediaType = Prisma.OrganizationHasDocumentGetPayload<{
  include: { document: true };
}>;
