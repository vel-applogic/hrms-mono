import { Injectable } from '@nestjs/common';
import { EmployeeMediaType, Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class EmployeeHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: {
    data: { userId: number; mediaId: number; type: EmployeeMediaType; caption?: string };
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const dbRec = await pc.employeeHasMedia.create({ data: params.data });
    if (!dbRec?.id) {
      throw new DbOperationError('EmployeeHasMedia not created');
    }
    return dbRec.id;
  }

  public async deleteManyByUserIdAndType(params: {
    userId: number;
    type: EmployeeMediaType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.employeeHasMedia.deleteMany({
      where: { userId: params.userId, type: params.type },
    });
  }

  public async findByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeHasMediaWithMediaType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeHasMedia.findMany({
      where: { userId: params.userId },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Type definitions
type EmployeeHasMediaSelectTableRecordType = Prisma.EmployeeHasMediaGetPayload<{}>;
type EmployeeHasMediaInsertTableRecordType = Prisma.EmployeeHasMediaCreateInput;
type EmployeeHasMediaUpdateTableRecordType = Prisma.EmployeeHasMediaUpdateInput;

export type EmployeeHasMediaWithMediaType = Prisma.EmployeeHasMediaGetPayload<{
  include: { media: true };
}>;
