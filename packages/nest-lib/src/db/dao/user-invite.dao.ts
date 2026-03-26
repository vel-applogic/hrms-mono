import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class UserInviteDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findByUserAndKey(params: {
    userId: number;
    inviteKey: string;
    tx?: Prisma.TransactionClient;
  }): Promise<UserInviteSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return (
      (await pc.userInvite.findFirst({
        where: { userId: params.userId, inviteKey: params.inviteKey },
      })) ?? undefined
    );
  }

  public async findPendingByUserAndOrg(params: {
    userId: number;
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<UserInviteSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return (
      (await pc.userInvite.findFirst({
        where: { userId: params.userId, organizationId: params.organizationId, acceptedAt: null },
        orderBy: { createdAt: 'desc' },
      })) ?? undefined
    );
  }

  public async create(params: { data: UserInviteInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.userInvite.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('UserInvite not created');
    }
    return created.id;
  }

  public async markAccepted(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.userInvite.update({
      where: { id: params.id },
      data: { acceptedAt: new Date() },
    });
  }
}

// Type aliases
type UserInviteSelectTableRecordType = Prisma.UserInviteGetPayload<{}>;
type UserInviteInsertTableRecordType = Prisma.UserInviteCreateInput;
type UserInviteUpdateTableRecordType = Prisma.UserInviteUpdateInput;
