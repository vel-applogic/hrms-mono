import { Injectable } from '@nestjs/common';
import type { Prisma, EmployeeHasMedia } from '@repo/db';
import { EmployeeMediaType } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class EmployeeHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: { userId: number; mediaId: number; type: EmployeeMediaType; caption?: string };
    tx?: Prisma.TransactionClient;
  }): Promise<EmployeeHasMedia> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeHasMedia.create({ data: params.data });
  }

  async deleteManyByUserIdAndType(params: {
    userId: number;
    type: EmployeeMediaType;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.employeeHasMedia.deleteMany({
      where: { userId: params.userId, type: params.type },
    });
  }

  async findByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<EmployeeHasMediaWithMediaType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.employeeHasMedia.findMany({
      where: { userId: params.userId },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export type EmployeeHasMediaWithMediaType = Prisma.EmployeeHasMediaGetPayload<{
  include: { media: true };
}>;
