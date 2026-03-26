import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError, DbRecordNotFoundError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class BranchDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<BranchSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.branch.findUnique({ where: { id: params.id } });
    return dbRec ?? undefined;
  }

  public async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<BranchSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.findMany({ where: { organizationId: params.organizationId }, orderBy: { name: 'asc' } });
  }

  public async create(params: { data: BranchInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.branch.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('Branch not created');
    }
    return created.id;
  }

  public async update(params: { id: number; data: BranchUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.branch.update({ where: { id: params.id }, data: params.data });
  }

  public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const dbRecord = await pc.branch.findUnique({ where: { id: params.id } });
    if (!dbRecord) {
      throw new DbRecordNotFoundError('Invalid branch id');
    }
    await pc.branch.delete({ where: { id: params.id } });
  }
}

// Type definitions
type BranchSelectTableRecordType = Prisma.BranchGetPayload<{}>;
type BranchInsertTableRecordType = Prisma.BranchCreateInput;
type BranchUpdateTableRecordType = Prisma.BranchUpdateInput;

export type { BranchSelectTableRecordType };
