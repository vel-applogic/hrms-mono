import { Injectable } from '@nestjs/common';
import type { Prisma, UserEmployeeHasMedia } from '@repo/db';
import { EmployeeMediaType } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserEmployeeHasMediaDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: { userId: number; mediaId: number; type: EmployeeMediaType; caption?: string };
    tx?: Prisma.TransactionClient;
  }): Promise<UserEmployeeHasMedia> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeHasMedia.create({ data: params.data });
  }

  async deleteManyByUserIdAndType(params: {
    userId: number;
    type: EmployeeMediaType;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.userEmployeeHasMedia.deleteMany({
      where: { userId: params.userId, type: params.type },
    });
  }

  async findByUserId(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<UserEmployeeHasMediaWithMediaType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userEmployeeHasMedia.findMany({
      where: { userId: params.userId },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export type UserEmployeeHasMediaWithMediaType = Prisma.UserEmployeeHasMediaGetPayload<{
  include: { media: true };
}>;
