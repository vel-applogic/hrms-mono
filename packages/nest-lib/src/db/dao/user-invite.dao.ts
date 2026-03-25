import { Injectable } from '@nestjs/common';
import type { Prisma, UserInvite } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserInviteDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByUserAndKey(params: { userId: number; inviteKey: string; tx?: Prisma.TransactionClient }): Promise<UserInvite | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInvite.findFirst({
      where: { userId: params.userId, inviteKey: params.inviteKey },
    });
  }

  async findPendingByUserAndOrg(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<UserInvite | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInvite.findFirst({
      where: { userId: params.userId, organizationId: params.organizationId, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(params: { data: Prisma.UserInviteCreateInput; tx?: Prisma.TransactionClient }): Promise<UserInvite> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInvite.create({ data: params.data });
  }

  async markAccepted(params: { id: number; tx?: Prisma.TransactionClient }): Promise<UserInvite> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInvite.update({
      where: { id: params.id },
      data: { acceptedAt: new Date() },
    });
  }
}
