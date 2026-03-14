import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { BaseDao } from './_base.dao.js';
import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class UserVerifyEmailDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: UserVerifyEmailInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.userVerifyEmail.create({
      data: params.data,
    });

    if (!dbRec?.id) {
      throw new DbOperationError('User verify email not created');
    }
    return dbRec.id;
  }

  public async getByUserIdAndKey(params: { userId: number; key: string; tx?: Prisma.TransactionClient }): Promise<UserVerifyEmailSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.userVerifyEmail.findFirst({
      where: {
        userId: params.userId,
        verifyEmailKey: params.key,
      },
    });

    return dbRec ?? undefined;
  }

  public async updateById(params: { id: number; data: UserVerifyEmailUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);

    await pc.userVerifyEmail.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  public async hasPendingVerification(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<boolean> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.userVerifyEmail.findFirst({
      where: { userId: params.userId, verifiedAt: null },
      select: { id: true },
    });

    return dbRec !== null;
  }
}

// Type definitions
type UserVerifyEmailSelectTableRecordType = Prisma.UserVerifyEmailGetPayload<{}>;
type UserVerifyEmailInsertTableRecordType = Prisma.UserVerifyEmailCreateInput;
type UserVerifyEmailUpdateTableRecordType = Prisma.UserVerifyEmailUpdateInput;
