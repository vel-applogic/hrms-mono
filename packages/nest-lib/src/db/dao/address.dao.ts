import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { BaseDao } from './_base.dao.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class AddressDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: AddressInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.address.create({
      data: params.data,
    });
    if (!created?.id) {
      throw new DbOperationError('Address not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: AddressUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.address.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async findByIdWithCountry(params: { id: number; tx?: Prisma.TransactionClient }): Promise<AddressWithCountryType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.address.findUnique({
      where: { id: params.id },
      include: { country: true },
    });
    return dbRec ?? undefined;
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.address.delete({ where: { id: params.id } });
  }
}

// Type definitions
type AddressInsertTableRecordType = Prisma.AddressCreateInput;
type AddressUpdateTableRecordType = Prisma.AddressUpdateInput;

export type AddressWithCountryType = Prisma.AddressGetPayload<{
  include: { country: true };
}>;
