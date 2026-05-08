import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class OrganisationHasDocumentDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: OrganisationHasDocumentInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisationHasDocument.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Organisation document not created');
    }
    return created.id;
  }

  public async findByOrganisationId(params: { organisationId: number; tx?: Prisma.TransactionClient }): Promise<OrganisationHasDocumentWithMediaType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasDocument.findMany({
      where: { organisationId: params.organisationId },
      include: { document: true },
    });
  }

  public async deleteManyByOrganisationId(params: { organisationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasDocument.deleteMany({
      where: { organisationId: params.organisationId },
    });
  }

  public async deleteManyByIds(params: { ids: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasDocument.deleteMany({
      where: { id: { in: params.ids } },
    });
  }
}

// Type definitions
type OrganisationHasDocumentInsertTableRecordType = Prisma.OrganisationHasDocumentCreateInput;

export type OrganisationHasDocumentWithMediaType = Prisma.OrganisationHasDocumentGetPayload<{
  include: { document: true };
}>;
