import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class ContactDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: ContactInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.contact.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Contact not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: ContactUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.contact.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<ContactSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.contact.findMany({
      where: { organizationId: params.organizationId },
    });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.contact.delete({ where: { id: params.id } });
  }

  public async deleteManyByIds(params: { ids: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.contact.deleteMany({
      where: { id: { in: params.ids } },
    });
  }
}

// Type definitions
type ContactInsertTableRecordType = Prisma.ContactCreateInput;
type ContactUpdateTableRecordType = Prisma.ContactUpdateInput;
type ContactSelectTableRecordType = Prisma.ContactGetPayload<{}>;

export type { ContactSelectTableRecordType };
